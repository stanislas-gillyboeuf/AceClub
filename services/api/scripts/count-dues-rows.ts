import "dotenv/config";
import { count } from "drizzle-orm";
import { db } from "../db";
import { duesType, duesAssignment, duesReminderLog } from "../db/schema/dues";

// Read-only: counts the rows left in the legacy dues tables (kept in the database, no longer
// used by the app) so they can be reviewed before any decision to drop them.
async function main() {
  const [[types], [assignments], [reminders]] = await Promise.all([
    db.select({ n: count() }).from(duesType),
    db.select({ n: count() }).from(duesAssignment),
    db.select({ n: count() }).from(duesReminderLog),
  ]);

  console.log({
    dues_type: types.n,
    dues_assignment: assignments.n,
    dues_reminder_log: reminders.n,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
