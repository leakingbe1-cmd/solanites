import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Database drivers run as plain Node modules on the server, not bundled.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
