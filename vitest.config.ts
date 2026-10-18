import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Components use the automatic JSX runtime, as in Next.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside Next's server bundle; tests run server code directly.
      "server-only": path.resolve(__dirname, "src/server/__tests__/serverOnlyStub.ts"),
    },
  },
  // The embedded Postgres takes a few seconds to start; allow for a busy machine.
  test: { include: ["src/**/*.test.ts"], environment: "node", testTimeout: 30_000, hookTimeout: 30_000 },
});
