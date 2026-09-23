import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["./tests/setup.ts"],
    sequence: {
      concurrent: false,
    },
    pool: "forks",
    alias: {
      bun: "./tests/mocks/bun.ts",
    },
    coverage: {
      provider: "v8",
      include: ["server/pricing/lib/engine/**/*.ts"],
      exclude: ["server/pricing/lib/engine/**/*.test.ts", "server/pricing/lib/engine/index.ts"],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
    },
  },
});
