import "dotenv/config";

// Mock Bun global for vitest (Node runtime)
if (typeof globalThis.Bun === "undefined") {
  (globalThis as Record<string, unknown>).Bun = {
    serve: (_opts: Record<string, unknown>) => ({
      port: 3000,
      stop: () => {},
    }),
  };
}
