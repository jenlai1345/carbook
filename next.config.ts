// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `experimental.appDir` is gone in Next 15+. Remove it.
  // `experimental.typedRoutes` moved to top-level.
  typedRoutes: true,

  // (optional) keep eslint on during build; set to true to bypass
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
