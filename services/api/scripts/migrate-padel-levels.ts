import "dotenv/config";
import { db } from "../db";
import { userPreference } from "../db/schema";
import { and, eq } from "drizzle-orm";

/**
 * One-off data migration: padel skillLevel moves from 4 categories to a 1-10 scale.
 * Run once after deploying the schema/validator changes: `bun run scripts/migrate-padel-levels.ts`
 */
const MAPPING: Record<string, string> = {
  Débutant: "2",
  Intermédiaire: "5",
  Avancé: "7",
  Expert: "9",
};

async function main() {
  let total = 0;
  for (const [oldValue, newValue] of Object.entries(MAPPING)) {
    const updated = await db
      .update(userPreference)
      .set({ skillLevel: newValue })
      .where(and(eq(userPreference.sport, "padel"), eq(userPreference.skillLevel, oldValue)))
      .returning({ id: userPreference.id });
    console.log(`${oldValue} -> ${newValue}: ${updated.length} row(s)`);
    total += updated.length;
  }
  console.log(`Done. ${total} row(s) migrated.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
