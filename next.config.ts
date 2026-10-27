import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the production server self-contained for the Windows runner.
  output: "standalone",

  // Prisma's generated client and query engine must be loaded by Node at runtime.
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Ensure native SQLite packages and their runtime files are copied into the
  // standalone output. The Windows runner will install/build the .node binary.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/**/*", "./node_modules/@prisma/**/*"],
  },
};

export default nextConfig;
