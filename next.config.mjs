import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * The sandbox preview is proxied from https://{port}-{sandboxId}.e2b.app,
   * so the dev server must accept that origin for /_next/* requests.
   */
  allowedDevOrigins: ["*.e2b.app"],

  /**
   * `next build` and `next dev` must never share a .next directory: a build
   * run while the dev server is live overwrites its chunks and the dev server
   * then dies with "__webpack_modules__[moduleId] is not a function".
   * Builds are redirected to .next-build via BUILD_DIST=1 (see package.json).
   */
  distDir: process.env.BUILD_DIST ? ".next-build" : ".next",
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
