import { verifySession, json } from "../../_auth.js";

// Forwards the editor's save requests to GitHub using the token stored on the server.
// Only the calls needed to commit data.json + images/ + files/ are allowed,
// and the contents of each write are checked so a signed-in session can never
// change the site's code (index.html, functions/, _headers ...) or rewrite history.
const SHA = "[0-9a-f]{40}";
const ALLOWED = [
  ["GET", /^$/],
  ["GET", /^git\/ref\/heads\/[\w.\-%]+$/],
  ["GET", new RegExp("^git/commits/" + SHA + "$")],
  ["GET", new RegExp("^git/trees/" + SHA + "$")],   // read-only: used to detect overwriting newer edits
  ["POST", /^git\/blobs$/],
  ["POST", /^git\/trees$/],
  ["POST", /^git\/commits$/],
  ["PATCH", /^git\/refs\/heads\/[\w.\-%]+$/],
];
// Files the website editor is allowed to write
const SAFE_PATH = /^(data\.json|images\/[0-9a-f]{8,64}\.(jpg|png|webp|gif)|files\/[0-9a-f]{8,64}\.pdf)$/;
const MAX_BODY = 30 * 1024 * 1024; // 30 MB per request

function bad(msg) { return json({ message: msg }, 400); }

function checkBody(path, b, env) {
  if (!b || typeof b !== "object") return "Invalid request";
  const branch = env.GITHUB_BRANCH || "main";
  if (path === "git/blobs") {
    if (typeof b.content !== "string" || (b.encoding && b.encoding !== "base64" && b.encoding !== "utf-8")) return "Invalid blob";
    return null;
  }
  if (path === "git/trees") {
    // must build on the existing tree (never replace the whole site) and only touch safe paths
    if (typeof b.base_tree !== "string" || !new RegExp("^" + SHA + "$").test(b.base_tree)) return "base_tree required";
    if (!Array.isArray(b.tree) || !b.tree.length || b.tree.length > 300) return "Invalid tree";
    for (const e of b.tree) {
      if (!e || typeof e.path !== "string" || !SAFE_PATH.test(e.path)) return "This file can't be changed from the website: " + (e && e.path);
      if (e.mode !== "100644" || e.type !== "blob" || typeof e.sha !== "string" || !new RegExp("^" + SHA + "$").test(e.sha)) return "Invalid tree entry";
      if ("content" in e) return "Invalid tree entry";
    }
    return null;
  }
  if (path === "git/commits") {
    if (!Array.isArray(b.parents) || b.parents.length !== 1) return "Invalid commit";
    if (typeof b.tree !== "string" || !new RegExp("^" + SHA + "$").test(b.tree)) return "Invalid commit";
    if (b.author || b.committer) return "Invalid commit";
    return null;
  }
  if (path.startsWith("git/refs/heads/")) {
    if (decodeURIComponent(path.slice("git/refs/heads/".length)) !== branch) return "Wrong branch";
    if (b.force) return "Force update not allowed";
    if (typeof b.sha !== "string" || !new RegExp("^" + SHA + "$").test(b.sha)) return "Invalid ref update";
    return null;
  }
  return "Not allowed";
}

export async function onRequest({ request, env, params }) {
  if (!(await verifySession(env, request))) return json({ message: "Not signed in" }, 401);
  const path = [].concat(params.path || []).join("/");
  const method = request.method.toUpperCase();
  if (!ALLOWED.some(([m, re]) => m === method && re.test(path))) return bad("Not allowed");

  let body;
  if (method !== "GET") {
    const len = Number(request.headers.get("Content-Length") || 0);
    if (len > MAX_BODY) return json({ message: "Too large" }, 413);
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ message: "Too large" }, 413);
    let b; try { b = JSON.parse(text); } catch (e) { return bad("Invalid JSON"); }
    const err = checkBody(path, b, env);
    if (err) return bad(err);
    body = JSON.stringify(b);
  }

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
    body,
  });
  if (res.status === 401) return json({ message: "GitHub token on the server is invalid or expired" }, 502);
  return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
