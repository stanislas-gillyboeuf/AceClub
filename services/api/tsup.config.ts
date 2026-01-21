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
  // Bundle all local imports into single file
  noExternal: [/.*/],
  // But keep these as external (will be installed on Vercel)
  external: ["pg-native"],
});
