import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteDuesTypeValidator } from "../validators";

// duesAssignment/duesReminderLog both FK duesType with onDelete cascade — deleting the type
// removes every assignment (and its reminder history) for it in one statement.
export const deleteDuesType = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteDuesTypeValidator>;

  const [existing] = await db
    .select({ id: duesType.id, organizationId: duesType.organizationId })
    .from(duesType)
    .where(eq(duesType.id, validated.duesTypeId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Dues type not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  await db.delete(duesType).where(eq(duesType.id, existing.id));

  return c.json({ success: true });
};
