import { Context } from "hono";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubTag, clubMemberTag } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { setMemberTagsValidator } from "../validators";

// Replaces a member's entire tag set in one call — simpler for a form with a multi-select than
// diffing add/remove client-side.
export const setMemberTags = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof setMemberTagsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (validated.tagIds.length > 0) {
    const validTags = await db
      .select({ id: clubTag.id })
      .from(clubTag)
      .where(and(eq(clubTag.organizationId, validated.organizationId), inArray(clubTag.id, validated.tagIds)));

    if (validTags.length !== new Set(validated.tagIds).size) {
      return c.json({ error: "BadRequest", message: "One or more tags do not belong to this club" }, 400);
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(clubMemberTag)
      .where(
        and(eq(clubMemberTag.organizationId, validated.organizationId), eq(clubMemberTag.userId, validated.userId)),
      );

    if (validated.tagIds.length > 0) {
      await tx.insert(clubMemberTag).values(
        validated.tagIds.map((tagId) => ({
          id: ulid(),
          organizationId: validated.organizationId,
          userId: validated.userId,
          tagId,
        })),
      );
    }
  });

  return c.json({ tagIds: validated.tagIds });
};
