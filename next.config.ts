// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  eslint: { ignoreDuringBuilds: false },
  images: {
    domains: ["parsefiles.back4app.com"],
  },

  webpack(config, { isServer }) {
    // Use the browser build of Parse only on the client bundle
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        parse: "parse/dist/parse.min.js",
      };
    }
    return config;
  },
};

export default nextConfig;
