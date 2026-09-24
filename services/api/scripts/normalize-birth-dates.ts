import "dotenv/config";
import { eq, isNotNull, and, sql } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import { parseBirthDate } from "./lib/parse-birth-date";

/**
 * One-off data fix: `user.date_of_birth` is a text column and older imports saved dates raw
 * (e.g. "31/12/2010"), which the pricing engine can't read. Rewrites them as "YYYY-MM-DD",
 * reading day/month the French way.
 *
 *   bun run scripts/normalize-birth-dates.ts --dry-run   # log only, writes nothing
 *   bun run scripts/normalize-birth-dates.ts             # applies the updates
 */
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const rows = await db
    .select({ id: user.id, email: user.email, dateOfBirth: user.date_of_birth })
    .from(user)
    .where(and(isNotNull(user.date_of_birth), sql`${user.date_of_birth} !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`));

  console.log(`${dryRun ? "[dry-run] " : ""}${rows.length} non-ISO date(s) found.`);

  let converted = 0;
  const unparseable: { email: string; dateOfBirth: string }[] = [];

  for (const row of rows) {
    const raw = row.dateOfBirth as string;
    const iso = parseBirthDate(raw);
    if (!iso) {
      unparseable.push({ email: row.email, dateOfBirth: raw });
      continue;
    }
    console.log(`${row.email}: "${raw}" -> ${iso}`);
    if (!dryRun) {
      await db.update(user).set({ date_of_birth: iso }).where(eq(user.id, row.id));
    }
    converted++;
  }

  console.log(`${dryRun ? "[dry-run] would convert" : "Converted"} ${converted} row(s).`);
  if (unparseable.length > 0) {
    console.log(`${unparseable.length} value(s) could not be read and were left untouched:`);
    for (const item of unparseable) console.log(`  ${item.email}: "${item.dateOfBirth}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
