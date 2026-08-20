import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";

const publicDir = resolve(process.cwd(), "dist", "public");
const port = Number(process.env.PORT ?? 3000);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".pdf": "application/pdf", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8" };

async function locate(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = decoded === "/" ? "/index.html" : decoded.replace(/\/$/, "");
  const candidates = [normalized, `${normalized}.html`, `${normalized}/index.html`, "/404.html"];
  for (const candidate of candidates) {
    const file = resolve(publicDir, `.${candidate}`);
    if (!file.startsWith(publicDir)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch { /* continue to the next static candidate */ }
  }
  return null;
}

createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const file = await locate(pathname);
    if (!file) { response.writeHead(404); response.end("Not found"); return; }
    const body = await readFile(file);
    response.writeHead(file.endsWith("404.html") ? 404 : 200, { "content-type": types[extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": file.includes("/_next/") ? "public, max-age=31536000, immutable" : "no-cache" });
    response.end(body);
  } catch {
    response.writeHead(500); response.end("Internal server error");
  }
}).listen(port, "0.0.0.0", () => console.log(`Static portfolio host listening on ${port}`));
