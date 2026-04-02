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
  },
});
