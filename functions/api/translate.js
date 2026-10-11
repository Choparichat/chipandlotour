import { verifySession, json } from "../_auth.js";

// POST /api/translate  {from:"en"|"th", texts:[...]}  -> {texts:[...]}
// Used by the site editor to fill the other language automatically (rough machine translation).
export async function onRequestPost({ request, env }) {
  if (!(await verifySession(env, request))) return json({ message: "Not signed in" }, 401);
  let b = {};
  try { b = await request.json(); } catch (e) {}
  const from = b.from === "th" ? "th" : "en", to = from === "th" ? "en" : "th";
  const texts = (Array.isArray(b.texts) ? b.texts : []).slice(0, 40).map(s => String(s || "").slice(0, 4500));
  const out = [];
  for (const s of texts) out.push(s.trim() ? await tr(env, s, from, to) : "");
  return json({ texts: out });
}
async function tr(env, s, from, to) {
  try {
    const r = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=" + from + "&tl=" + to, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": "Mozilla/5.0" },
      body: "q=" + encodeURIComponent(s),
    });
    if (r.ok) {
      const j = await r.json();
      const v = (j && j[0] ? j[0].map(x => x && x[0]).join("") : "").trim();
      if (v) return v;
    }
  } catch (e) {}
  // Optional fallback: Cloudflare Workers AI (add an "AI" binding in Pages settings to enable)
  try {
    if (env.AI) {
      const r = await env.AI.run("@cf/meta/m2m100-1.2b", { text: s, source_lang: from === "th" ? "thai" : "english", target_lang: to === "th" ? "thai" : "english" });
      if (r && r.translated_text) return r.translated_text;
    }
  } catch (e) {}
  return null;
}
