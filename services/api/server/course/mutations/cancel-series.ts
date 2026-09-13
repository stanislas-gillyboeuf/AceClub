import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { cancelSeriesValidator } from "../validators";
import { cancelFutureOccurrences } from "../lib/occurrence-generator";

export const cancelSeries = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof cancelSeriesValidator>;

  const [existing] = await db
    .select()
    .from(course)
    .where(eq(course.id, validated.courseId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Course not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  await db.transaction(async (tx) => {
    await cancelFutureOccurrences(tx, existing.id);
    await tx.update(course).set({ status: "cancelled" }).where(eq(course.id, existing.id));
  });

  return c.json({ success: true });
};
