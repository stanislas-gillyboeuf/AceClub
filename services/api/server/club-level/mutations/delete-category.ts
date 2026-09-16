import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubLevelCategory } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteCategoryValidator } from "../validators";

// Members already carrying this category's name as their (free-text) skillLevel keep it as
// plain text — deleting the category only removes it from future pickers, no data integrity
// issue since skillLevel was never FK'd to this table.
export const deleteCategory = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteCategoryValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  await db
    .delete(clubLevelCategory)
    .where(
      and(
        eq(clubLevelCategory.id, validated.categoryId),
        eq(clubLevelCategory.organizationId, validated.organizationId),
      ),
    );

  return c.json({ success: true });
};
