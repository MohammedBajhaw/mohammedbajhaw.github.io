import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["3000-ixeogoe5oiwnyinir0wh8-c9c6bd25.sg1.manus.computer", "127.0.0.1"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
