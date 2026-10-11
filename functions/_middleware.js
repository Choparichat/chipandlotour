import SEO from "./_seo.js";

// 1) Sends visitors of the old address (chipandlotour.pages.dev) and www. to the main domain,
//    so there is only one copy of the site for Google and the login protection on
//    chipandlotour.com (Cloudflare rate limiting) cannot be bypassed via pages.dev.
//    To turn this off (e.g. if the domain is not renewed), add the variable CANONICAL_HOST = off in Cloudflare.
// 2) Search-engine support: every page has its own address (/tours/chiangmai, /tour/<name>-<id>, Thai under /th/).
//    For those addresses this file serves index.html with that page's own title, description,
//    share image and structured data, builds /sitemap.xml from data.json, and answers 404 for pages that do not exist.
//    If anything here fails, the request falls through to the normal static site.

let cache = null; // { at, pre, mid, post, headers, data }
const TTL = 60000;

async function load(env, request) {
  if (cache && Date.now() - cache.at < TTL) return cache;
  const at = (p) => env.ASSETS.fetch(new Request(new URL(p, request.url).toString(), { headers: { accept: "text/html,*/*" } }));
  const [h, d] = await Promise.all([at("/"), at("/data.json")]);
  if (!h.ok || !d.ok) return null;
  const html = await h.text();
  let data = null;
  try { data = JSON.parse(await d.text()); } catch (e) {}
  // index.html is cut once into three pieces: [.. <!--seo-->] page tags [<!--/seo--> .. <div id="app"></div>] summary [rest]
  const A = "<!--seo-->", B = "<!--/seo-->", C = '<div id="app"></div>';
  const i = html.indexOf(A), j = html.indexOf(B), k = html.indexOf(C);
  if (!data || typeof data !== "object" || !data.brand || i < 0 || j < i || k < j) return null;
  const headers = [];
  h.headers.forEach((v, k) => { if (!/^(content-length|etag|last-modified|content-encoding|transfer-encoding|accept-ranges|age)$/i.test(k)) headers.push([k, v]); });
  cache = { at: Date.now(), pre: html.slice(0, i + A.length), mid: html.slice(j, k + C.length), post: html.slice(k + C.length), headers, data };
  return cache;
}

function bangkokToday() { return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10); }

function sitemap(data, origin) {
  const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rows = SEO.urls(data, origin).map(([loc, alts]) =>
    "<url><loc>" + x(loc) + "</loc>" + (alts || []).map(([l, h]) => '<xhtml:link rel="alternate" hreflang="' + l + '" href="' + x(h) + '"/>').join("") + "</url>");
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + rows.join("\n") + "\n</urlset>\n";
}

async function page(context, url, mainOrigin) {
  const { request, env, next } = context;
  const p = url.pathname;
  if (p.indexOf("/api/") === 0) return next();
  if (p === "/index.html") return Response.redirect(url.origin + "/" + url.search, 301);
  if (p === "/th") return Response.redirect(url.origin + "/th/" + url.search, 301);

  if (p === "/sitemap.xml") {
    const c = await load(env, request);
    if (!c) return next();
    return new Response(request.method === "HEAD" ? null : sitemap(c.data, mainOrigin), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" } });
  }

  // A file (robots.txt, favicon, ...). Pages answers unknown paths with the home page; a missing file must be a real 404.
  if (/\.[a-z0-9]{1,8}$/i.test(p)) {
    const res = await next();
    if (res.status === 200 && /text\/html/i.test(res.headers.get("content-type") || "") && !/\.html?$/i.test(p))
      return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
    return res;
  }

  // One address per page: no trailing slash (except the two home pages)
  if (p.length > 1 && p !== "/th/" && p.charAt(p.length - 1) === "/") return Response.redirect(url.origin + p.replace(/\/+$/, "") + url.search, 301);

  const c = await load(env, request);
  if (!c) return next();
  const lg = SEO.isTh(p) ? "th" : "en";
  const r = SEO.route(SEO.vhash(p, ""), c.data);
  const m = SEO.meta(c.data, r, lg, bangkokToday(), mainOrigin);

  // /tour/<id> or an old name in the address -> the current address of that tour
  if (!m.notFound && !r.nf) {
    const want = SEO.path(c.data, r, lg);
    if (want !== p && r.v === "tour") return Response.redirect(url.origin + want + url.search, 301);
  }

  const html = (lg === "th" ? c.pre.replace('<html lang="en"', '<html lang="th"') : c.pre) + "\n" + SEO.head(m) + "\n" + c.mid + "\n" + SEO.plain(c.data, r, lg, m) + c.post;

  const headers = new Headers(c.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  if (!headers.has("cache-control")) headers.set("cache-control", "public, max-age=0, must-revalidate");
  // Same protection as the _headers file, in case it is not applied to pages built here
  const sec = { "x-frame-options": "SAMEORIGIN", "content-security-policy": "frame-ancestors 'self'", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "permissions-policy": "geolocation=(), microphone=(), camera=(), payment=()" };
  for (const k in sec) if (!headers.has(k)) headers.set(k, sec[k]);
  return new Response(request.method === "HEAD" ? null : html, { status: m.notFound ? 404 : 200, headers });
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const canonical = (env.CANONICAL_HOST || "chipandlotour.com").toLowerCase();
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const project = (env.PAGES_PROJECT || "chipandlotour") + ".pages.dev";
  if (canonical !== "off" && (host === project || host === "www." + canonical)) {
    url.hostname = canonical; url.protocol = "https:"; url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  try {
    // Addresses written into the pages always use the main domain; with CANONICAL_HOST = off they follow the address being visited.
    return await page(context, url, canonical === "off" ? url.origin : "https://" + canonical);
  } catch (e) {
    return next();
  }
}
