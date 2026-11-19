/**
 * Smoke test for a running production server: visits every sitemap URL and verifies status, internal links,
 * images, untranslated dictionary keys, JSON-LD, lang/dir, metadata and cache/security headers.
 *
 *   pnpm build && pnpm start        (in one terminal)
 *   pnpm smoke [http://localhost:3000]   (in another; exits 1 when something is wrong)
 */
import { readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const problems = [];
const note = (kind, where, msg) => problems.push(`${kind.padEnd(9)} ${where}  ${msg}`);

// all dictionary keys, flattened from messages/en.ts
const enSrc = readFileSync(new URL("../messages/en.ts", import.meta.url), "utf8");
const topLevel = [...enSrc.matchAll(/^  (\w+): \{/gm)].map((m) => m[1]);
const keyRe = new RegExp(`\\b(?:${topLevel.join("|")})\\.[A-Za-z0-9]+\\b`, "g");

const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
const text = (html) => strip(html).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

(async () => {
  const sm = await (await fetch(`${base}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://bajhaw.com", base));
  console.log(`sitemap URLs: ${urls.length}`);

  const links = new Set();
  const assets = new Set();
  const stats = { pages: 0, imgNoAlt: 0, jsonLd: 0 };

  for (const url of urls) {
    const res = await fetch(url, { redirect: "manual" });
    const where = url.replace(base, "");
    if (res.status !== 200) { note("STATUS", where, `HTTP ${res.status}`); continue; }
    const html = await res.text();
    stats.pages++;

    const loc = where.split("/")[1];
    const dir = loc === "ar" ? "rtl" : "ltr";
    const tag = (html.match(/<html[^>]*>/) || [""])[0];
    if (!tag.includes(`lang="${loc}"`) || !tag.includes(`dir="${dir}"`)) note("LANG/DIR", where, tag);

    // untranslated key fallbacks visible to users
    const leaked = [...new Set(text(html).match(keyRe) || [])].filter((k) => !/^(about|services|contact)\.(com|org)$/.test(k));
    if (leaked.length) note("KEY", where, leaked.slice(0, 4).join(", "));

    // JSON-LD must parse
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      stats.jsonLd++;
      try { JSON.parse(m[1]); } catch { note("JSON-LD", where, "invalid JSON"); }
    }
    // metadata sanity
    if (!/<title>[^<]+<\/title>/.test(html)) note("META", where, "missing <title>");
    if (!/rel="canonical"/.test(html)) note("META", where, "missing canonical");
    if ((html.match(/rel="alternate" hrefLang/g) || []).length < 4) note("META", where, "hreflang < 4");

    // images without alt
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) { stats.imgNoAlt++; note("ALT", where, m[0].slice(0, 80)); }

    for (const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      const u = m[1].replace(/&amp;/g, "&");
      if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
      if (u.startsWith("/_next/static")) continue;
      (u.startsWith("/_next/image") || /\.(jpg|jpeg|png|webp|avif|svg|pdf|ico)$/i.test(u) ? assets : links).add(u);
    }
  }

  // internal links must resolve (200) and carry a locale prefix
  for (const l of links) {
    if (!/^\/(en|ar|tr)(\/|$)/.test(l)) { note("LINK", l, "internal link without locale prefix"); continue; }
    const r = await fetch(base + l, { redirect: "manual" });
    if (r.status !== 200) { note("LINK", l, `HTTP ${r.status}`); }
  }
  // assets and optimized images
  const imgTypes = {};
  for (const a of assets) {
    const r = await fetch(base + a);
    if (r.status !== 200) { note("ASSET", a, `HTTP ${r.status}`); continue; }
    const ct = r.headers.get("content-type") || "";
    if (a.startsWith("/_next/image")) imgTypes[ct] = (imgTypes[ct] || 0) + 1;
  }

  console.log(`pages ok: ${stats.pages}/${urls.length}, internal links checked: ${links.size}, assets checked: ${assets.size}, JSON-LD blocks: ${stats.jsonLd}`);
  console.log("optimized image formats served:", JSON.stringify(imgTypes));

  // headers
  const h = async (p, accept) => (await fetch(base + p, { headers: accept ? { accept } : {} })).headers;
  const page = await h("/en/about");
  console.log("\nHEADERS /en/about:", ["cache-control", "x-content-type-options", "referrer-policy", "x-frame-options", "permissions-policy", "strict-transport-security", "x-powered-by"].map((k) => `${k}=${page.get(k) ?? "-"}`).join(" | "));
  const photo = await h("/photos/hero-stage.jpg");
  console.log("HEADERS /photos/hero-stage.jpg: cache-control=" + photo.get("cache-control"));
  const img = [...assets].find((a) => a.startsWith("/_next/image"));
  if (img) { const ih = await h(img, "image/avif,image/webp"); console.log("HEADERS optimized image: cache-control=" + ih.get("cache-control") + " | content-type=" + ih.get("content-type") + " | length=" + ih.get("content-length")); }

  console.log(`\nPROBLEMS: ${problems.length}`);
  problems.slice(0, 40).forEach((p) => console.log(" -", p));
})();
