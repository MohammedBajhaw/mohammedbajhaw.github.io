import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist/public", { recursive: true, force: true });
await mkdir("dist/public", { recursive: true });
await cp("out", "dist/public", { recursive: true });
await cp("server/staticHost.mjs", "dist/index.js");
console.log("Static Next.js export copied to dist/public for deployment.");
