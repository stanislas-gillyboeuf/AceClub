import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "randomuser.me" }],
  },

  reactCompiler: true,

  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
