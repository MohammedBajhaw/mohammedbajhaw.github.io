import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MANAGED_ASSET_HOST = "https://engportfolio-zhkmdjuy.manus.space";
const MANAGED_PATH = /^\/manus-storage\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

Deno.serve(async (request) => {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!MANAGED_PATH.test(path)) {
    return new Response("Invalid project media path.", { status: 400 });
  }

  const upstream = await fetch(`${MANAGED_ASSET_HOST}${path}`, { redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Project media is unavailable.", { status: upstream.status || 502 });
  }

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=86400, s-maxage=604800",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  return new Response(upstream.body, { status: 200, headers });
});
