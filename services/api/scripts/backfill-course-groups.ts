import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { course } from "../db/schema/course/schema";
import { syncCourseGroupMembers } from "../server/course/lib/course-group-sync";

/**
 * One-off catch-up for courses created before course-discussion-groups existed: creates (or
 * syncs) each active course's group the same way create-course/enroll/unenroll do going forward.
 * Idempotent — safe to re-run.
 *
 *   bun run scripts/backfill-course-groups.ts
 */
async function main() {
  const courses = await db
    .select({ id: course.id, name: course.name })
    .from(course)
    .where(eq(course.status, "active"));

  console.log(`Found ${courses.length} active course(s).\n`);

  let synced = 0;
  let failed = 0;

  for (const c of courses) {
    try {
      await syncCourseGroupMembers(c.id);
      synced++;
      console.log(`OK   ${c.name} (${c.id})`);
    } catch (error) {
      failed++;
      console.error(`FAIL ${c.name} (${c.id}):`, error);
    }
  }

  console.log(`\nDone — ${synced} synced, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
