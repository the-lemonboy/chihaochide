const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const store = (env) => env?.food_data || (typeof food_data !== "undefined" ? food_data : null);

export async function onRequestPut({ request, env }) {
  const kv = store(env);
  if (!kv) return json({ error: "KV binding food_data is missing" }, 503);
  const body = await request.json();
  const placeIds = Array.isArray(body.placeIds) ? body.placeIds.filter(Number.isInteger) : [];
  await kv.put("picks", JSON.stringify(placeIds));
  return json({ placeIds });
}
