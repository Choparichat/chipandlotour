import { verifySession, json } from "../../_auth.js";

// Forwards the editor's save requests to GitHub using the token stored on the server.
// Only the calls needed to commit data.json + images are allowed.
const ALLOWED = [
  ["GET", /^$/],
  ["GET", /^git\/ref\/heads\/[\w.\-%]+$/],
  ["GET", /^git\/commits\/[0-9a-f]{40}$/],
  ["POST", /^git\/blobs$/],
  ["POST", /^git\/trees$/],
  ["POST", /^git\/commits$/],
  ["PATCH", /^git\/refs\/heads\/[\w.\-%]+$/],
];
export async function onRequest({ request, env, params }) {
  if (!(await verifySession(env, request))) return json({ message: "Not signed in" }, 401);
  const path = [].concat(params.path || []).join("/");
  const method = request.method.toUpperCase();
  if (!ALLOWED.some(([m, re]) => m === method && re.test(path))) return json({ message: "Not allowed" }, 403);
  const url = (env.GITHUB_API || "https://api.github.com") + "/repos/" + env.GITHUB_REPO + (path ? "/" + path : "");
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "chipandlotour-site",
      ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
    },
    body: method === "GET" ? undefined : request.body,
  });
  if (res.status === 401) return json({ message: "GitHub token on the server is invalid or expired" }, 502);
  return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
