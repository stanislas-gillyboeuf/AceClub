import { runSeed } from "./seed/index.js";

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
