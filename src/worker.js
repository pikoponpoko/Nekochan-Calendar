// Stores each device group's plan (picked festivals, status, checklist) in KV, keyed by the SHA-256 of a sync code.
const KEY = /^[0-9a-f]{64}$/;
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/api\/sync\/([^/]+)$/);
    if (!m) return env.ASSETS.fetch(req);
    const k = m[1];
    if (!KEY.test(k)) return json({ error: "bad key" }, 400);
    if (req.method === "GET") {
      const v = await env.SYNC.get(k);
      return v ? new Response(v, { headers: { "content-type": "application/json", "cache-control": "no-store" } }) : json({ error: "not found" }, 404);
    }
    if (req.method === "PUT") {
      const body = await req.text();
      if (body.length > 200000) return json({ error: "too large" }, 413);
      let d;
      try { d = JSON.parse(body) } catch (e) { return json({ error: "bad json" }, 400) }
      if (!d || typeof d.t !== "number") return json({ error: "bad body" }, 400);
      const cur = await env.SYNC.get(k, "json");
      if (cur && cur.t > d.t) return json(cur, 409);
      await env.SYNC.put(k, body);
      return json({ ok: true, t: d.t });
    }
    return json({ error: "method" }, 405);
  }
};
