import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "entry-vercel.ts" },
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  splitting: false,
  sourcemap: false,
  clean: true,
  // Bundle everything except pg (uses CommonJS dynamic requires)
  noExternal: [/^(?!pg).*/],
  external: ["pg", "pg-native", "pg-pool", "pg-protocol", "pg-types", "pgpass"],
});
