// Sends visitors of the old address (chipandlotour.pages.dev) and www. to the main domain,
// so there is only one copy of the site for Google and the login protection on
// chipandlotour.com (Cloudflare rate limiting) cannot be bypassed via pages.dev.
// To turn this off (e.g. if the domain is not renewed), add the variable CANONICAL_HOST = off in Cloudflare.
export async function onRequest({ request, env, next }) {
  const canonical = (env.CANONICAL_HOST || "chipandlotour.com").toLowerCase();
  if (canonical === "off") return next();
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const project = (env.PAGES_PROJECT || "chipandlotour") + ".pages.dev";
  if (host === project || host === "www." + canonical) {
    url.hostname = canonical; url.protocol = "https:"; url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
