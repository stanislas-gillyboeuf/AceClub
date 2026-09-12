import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesAssignment } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { markPaidValidator } from "../validators";

export const markPaid = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof markPaidValidator>;

  const [existing] = await db
    .select()
    .from(duesAssignment)
    .where(eq(duesAssignment.id, validated.assignmentId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Assignment not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [updated] = await db
    .update(duesAssignment)
    .set({
      status: "paid",
      paidAt: new Date(),
      paidMethod: validated.paidMethod ?? null,
      notes: validated.notes ?? existing.notes,
    })
    .where(eq(duesAssignment.id, validated.assignmentId))
    .returning();

  return c.json(updated);
};
