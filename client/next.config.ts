import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Where the dashboard API (NestJS) runs. The admin talks to it through same-origin /api and /uploads rewrites, so the session cookie is first-party.
const API_ORIGIN = (process.env.API_ORIGIN || "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Optional override so a verification build never collides with a running `next dev` (.next).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    // Only the site's own folders can be optimized, and only at one quality: the optimizer is not an open proxy.
    // Backend-hosted images: add their host to `remotePatterns` when the real data source goes live.
    localPatterns: [
      { pathname: "/figures/**" },
      { pathname: "/uploads/**" },
    ],
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    // Optimized variants are immutable per source file, so keep them for 31 days.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // Unhashed public files: revalidate daily, serve stale for a week while refreshing in the background.
        source: "/:folder(figures|cv)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
