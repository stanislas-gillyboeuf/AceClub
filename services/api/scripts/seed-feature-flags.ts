import "dotenv/config";
import { db } from "../db";
import { featureFlag } from "../db/schema/feature-flag/schema";
import { ulid } from "ulid";

const FEATURE_FLAGS = [
  {
    id: ulid(),
    key: "court_booking",
    enabled: false,
    description: "Active la réservation de terrain (carte profil + écran de réservation).",
  },
];

async function main() {
  console.log("Seeding feature flags...\n");

  for (const flag of FEATURE_FLAGS) {
    try {
      await db.insert(featureFlag).values(flag).onConflictDoNothing();
      console.log(`Inserted: ${flag.key} (enabled: ${flag.enabled})`);
    } catch (error) {
      console.error(`Failed to insert ${flag.key}:`, error);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main();
