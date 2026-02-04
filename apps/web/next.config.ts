import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "randomuser.me" }],
  },

  // Next.js 16 features
  cacheComponents: true, // Enable Cache Components with "use cache"
  reactCompiler: true, // Enable React Compiler for automatic memoization

  experimental: {
    turbopackFileSystemCacheForDev: true, // Faster dev restarts
  },
};

export default nextConfig;
