import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    resolveAlias: {
      "@/*": "./*",
    },
  },
  webpack(config) {
    config.resolve.alias = { ...(config.resolve.alias || {}), "@": dirname };
    return config;
  },
};

export default nextConfig;
