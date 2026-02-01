import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_zqlindsznuttfkofouqq",
  dirs: ["./trigger"],
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    external: ["pg"],
  },
});
