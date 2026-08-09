import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema/court/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateCourtValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const updateCourt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateCourtValidator>;

  const [courtRecord] = await db.select().from(court).where(eq(court.id, body.courtId)).limit(1);
  if (!courtRecord) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const isAdmin = await assertOrgAdmin(currentUser.id, courtRecord.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Only club admins can edit courts" }, 403);
  }

  const { courtId, ...updates } = body;

  const [updated] = await db
    .update(court)
    .set(updates)
    .where(eq(court.id, courtId))
    .returning();

  return c.json({ data: updated });
};
