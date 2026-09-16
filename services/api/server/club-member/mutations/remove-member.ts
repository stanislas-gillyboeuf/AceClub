import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, clubMemberProfile, clubMemberNote, memberSubscription } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { removeMemberValidator } from "../validators";

// Removes club membership only — booking history stays intact (legitimate historical data
// independent of current membership). Club-scoped extras (profile, notes, subscriptions) are
// cleaned up since they're meaningless without membership.
export const removeMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof removeMemberValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [memberRow] = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(
      and(eq(member.organizationId, validated.organizationId), eq(member.userId, validated.userId)),
    )
    .limit(1);

  if (!memberRow) {
    return c.json({ error: "NotFound", message: "Member not found" }, 404);
  }

  if (memberRow.role === "owner") {
    return c.json({ error: "BadRequest", message: "The club owner can't be removed" }, 400);
  }

  const scope = and(
    eq(clubMemberProfile.organizationId, validated.organizationId),
    eq(clubMemberProfile.userId, validated.userId),
  );

  await db.transaction(async (tx) => {
    await tx.delete(member).where(eq(member.id, memberRow.id));
    await tx.delete(clubMemberProfile).where(scope);
    await tx
      .delete(clubMemberNote)
      .where(
        and(
          eq(clubMemberNote.organizationId, validated.organizationId),
          eq(clubMemberNote.userId, validated.userId),
        ),
      );
    await tx
      .delete(memberSubscription)
      .where(
        and(
          eq(memberSubscription.organizationId, validated.organizationId),
          eq(memberSubscription.userId, validated.userId),
        ),
      );
  });

  return c.json({ success: true });
};
