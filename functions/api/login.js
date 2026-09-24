import { configured, checkPassword, makeSession, json } from "../_auth.js";

// GET  /api/login  → tells the page whether password login is set up
// POST /api/login  {password} → {token, exp, branch}
export async function onRequestGet({ env }) {
  return json({ enabled: configured(env) });
}
export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ message: "Password login is not set up" }, 503);
  let body = {};
  try { body = await request.json(); } catch (e) {}
  if (!checkPassword(env, body.password)) {
    await new Promise(r => setTimeout(r, 1200)); // slow down guessing
    return json({ message: "Wrong password" }, 401);
  }
  const s = await makeSession(env);
  return json({ token: s.token, exp: s.exp, branch: env.GITHUB_BRANCH || "main" });
}
