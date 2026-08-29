const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const store = (env) => env?.food_data || (typeof food_data !== "undefined" ? food_data : null);

export async function onRequestDelete({ params, env }) {
  const kv = store(env);
  if (!kv) return json({ error: "KV binding food_data is missing" }, 503);
  const id = Number(params.id);
  const places = (await kv.get("places", { type: "json" }) || []).filter((place) => place.id !== id);
  const picks = (await kv.get("picks", { type: "json" }) || []).filter((placeId) => placeId !== id);
  await Promise.all([kv.put("places", JSON.stringify(places)), kv.put("picks", JSON.stringify(picks))]);
  return json({ ok: true });
}
