// Shared helpers for the admin login (Cloudflare Pages Functions).
// Required environment variables (Cloudflare → Settings → Variables and Secrets):
//   ADMIN_PASSWORD  – the password the site owner types to edit the site
//   GITHUB_TOKEN    – fine-grained token with Contents: Read and write on the repo
//   GITHUB_REPO     – e.g. username/chipandlotour
//   GITHUB_BRANCH   – optional, default "main"
const enc = new TextEncoder();
const DAYS = 30;

async function hmac(env, msg) {
  // Secret depends on the password + token, so changing the password signs everyone out.
  const key = await crypto.subtle.importKey("raw", enc.encode("cnl|" + env.ADMIN_PASSWORD + "|" + env.GITHUB_TOKEN),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function same(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
}
export function configured(env) { return !!(env.ADMIN_PASSWORD && env.GITHUB_TOKEN && env.GITHUB_REPO); }
export function checkPassword(env, pw) { return same(String(pw || ""), String(env.ADMIN_PASSWORD || "")); }
export async function makeSession(env) {
  const exp = Date.now() + DAYS * 864e5;
  return { token: exp + "." + (await hmac(env, "s." + exp)), exp };
}
export async function verifySession(env, request) {
  if (!configured(env)) return false;
  const m = (request.headers.get("Authorization") || "").match(/^Bearer (\d+)\.([\w-]+)$/);
  if (!m || Number(m[1]) < Date.now()) return false;
  return same(m[2], await hmac(env, "s." + m[1]));
}
export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
