const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const store = (env) => env?.food_data || (typeof food_data !== "undefined" ? food_data : null);

export async function onRequestGet({ env }) {
  const kv = store(env);
  if (!kv) return json({ error: "KV binding food_data is missing" }, 503);
  const places = await kv.get("places", { type: "json" }) || [];
  const picks = await kv.get("picks", { type: "json" }) || [];
  return json(places.map((place) => ({ ...place, selected: picks.includes(place.id) ? 1 : 0 })));
}

export async function onRequestPost({ request, env }) {
  const kv = store(env);
  if (!kv) return json({ error: "KV binding food_data is missing" }, 503);
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return json({ error: "name is required" }, 400);
  const places = await kv.get("places", { type: "json" }) || [];
  const place = { id: Date.now(), name, tag: body.tag?.trim() || "未分类", emoji: body.emoji || "✨", color: body.color || "blue", createdAt: Date.now() };
  places.push(place);
  await kv.put("places", JSON.stringify(places));
  return json(place, 201);
}
