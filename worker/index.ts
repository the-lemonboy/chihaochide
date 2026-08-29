/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function handleApi(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return json({ error: "Database is not configured" }, 503);
  const url = new URL(request.url);
  try {
    if (url.pathname === "/api/places" && request.method === "GET") {
      const result = await env.DB.prepare(`SELECT p.id, p.name, p.tag, p.emoji, p.color, EXISTS(SELECT 1 FROM picks k WHERE k.place_id=p.id) AS selected FROM places p ORDER BY p.created_at, p.id`).all();
      return json(result.results ?? []);
    }
    if (url.pathname === "/api/places" && request.method === "POST") {
      const body = await request.json() as { name?: string; tag?: string; emoji?: string; color?: string };
      const name = body.name?.trim();
      if (!name) return json({ error: "name is required" }, 400);
      const result = await env.DB.prepare(`INSERT INTO places (name, tag, emoji, color, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id, name, tag, emoji, color`).bind(name, body.tag?.trim() || "未分类", body.emoji || "✨", body.color || "blue", Date.now()).first();
      return json(result, 201);
    }
    const match = url.pathname.match(/^\/api\/places\/(\d+)$/);
    if (match && request.method === "DELETE") {
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM picks WHERE place_id = ?`).bind(Number(match[1])),
        env.DB.prepare(`DELETE FROM places WHERE id = ?`).bind(Number(match[1])),
      ]);
      return json({ ok: true });
    }
    if (url.pathname === "/api/picks" && request.method === "PUT") {
      const body = await request.json() as { placeIds?: unknown };
      const ids = Array.isArray(body.placeIds) ? body.placeIds.filter((x): x is number => Number.isInteger(x)) : [];
      const statements = [env.DB.prepare(`DELETE FROM picks`), ...ids.map((id) => env.DB.prepare(`INSERT OR IGNORE INTO picks (place_id, updated_at) SELECT id, ? FROM places WHERE id = ?`).bind(Date.now(), id))];
      await env.DB.batch(statements);
      return json({ placeIds: ids });
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API error", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export default worker;
