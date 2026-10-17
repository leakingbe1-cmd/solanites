import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside Next's server bundle; tests run server code directly.
      "server-only": path.resolve(__dirname, "src/server/__tests__/serverOnlyStub.ts"),
    },
  },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
