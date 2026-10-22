import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the production server self-contained for the Windows runner.
  output: "standalone",

  // SQLite drivers contain native bindings and must be loaded by Node at runtime
  // instead of being bundled by webpack/turbopack.
  serverExternalPackages: ["better-sqlite3", "sqlite3"],

  // Ensure native SQLite packages and their runtime files are copied into the
  // standalone output. The Windows runner will install/build the .node binary.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/better-sqlite3/**/*",
      "./node_modules/sqlite3/**/*",
    ],
  },

  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
};

export default nextConfig;
