import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user as userTable } from "../../../db/schema/auth/schema";
import { clubMemberProfile, household } from "../../../db/schema/club-member/schema";
import { claimProfileValidator } from "../validators";
import { invalidateUserClubIds } from "../../../lib/club-access";

/**
 * Merges a CSV-imported ("ghost") member profile into the caller's own account, once their email
 * is verified and matches that ghost — see queries/find-imported-profiles.ts for how a match is
 * found. The match is re-validated here server-side; the client's claim is never trusted blindly.
 */
export const claimProfile = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof claimProfileValidator>;

  if (!currentUser.emailVerified) {
    return c.json({ error: "Forbidden", message: "Email not verified" }, 403);
  }
  const realEmail = currentUser.email.trim().toLowerCase();

  const [ghost] = await db
    .select()
    .from(userTable)
    .where(and(eq(userTable.id, validated.ghostUserId), eq(userTable.is_ghost, true)))
    .limit(1);
  if (!ghost) {
    return c.json({ error: "NotFound", message: "Profile not found" }, 404);
  }

  const [ghostMember] = await db
    .select()
    .from(member)
    .where(and(eq(member.userId, ghost.id), eq(member.organizationId, validated.organizationId)))
    .limit(1);
  const [ghostProfile] = await db
    .select()
    .from(clubMemberProfile)
    .where(
      and(
        eq(clubMemberProfile.userId, ghost.id),
        eq(clubMemberProfile.organizationId, validated.organizationId),
      ),
    )
    .limit(1);
  if (!ghostMember || !ghostProfile) {
    return c.json({ error: "NotFound", message: "Profile not found" }, 404);
  }

  const [profileHousehold] = ghostProfile.householdId
    ? await db.select().from(household).where(eq(household.id, ghostProfile.householdId)).limit(1)
    : [];

  const directMatch = ghost.email.trim().toLowerCase() === realEmail;
  const householdMatch = profileHousehold?.contactEmail?.trim().toLowerCase() === realEmail;
  if (!directMatch && !householdMatch) {
    return c.json({ error: "Forbidden", message: "This profile does not match your verified email" }, 403);
  }

  const [realUserHasMember, realUserHasProfile] = await Promise.all([
    db
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.userId, currentUser.id), eq(member.organizationId, validated.organizationId)))
      .limit(1),
    db
      .select({ id: clubMemberProfile.id })
      .from(clubMemberProfile)
      .where(
        and(
          eq(clubMemberProfile.userId, currentUser.id),
          eq(clubMemberProfile.organizationId, validated.organizationId),
        ),
      )
      .limit(1),
  ]);
  if (realUserHasMember.length > 0 || realUserHasProfile.length > 0) {
    return c.json({ error: "Conflict", message: "You are already a member of this club" }, 409);
  }

  await db.transaction(async (tx) => {
    await tx.update(member).set({ userId: currentUser.id }).where(eq(member.id, ghostMember.id));
    await tx
      .update(clubMemberProfile)
      .set({ userId: currentUser.id })
      .where(eq(clubMemberProfile.id, ghostProfile.id));
    if (profileHousehold?.payerUserId === ghost.id) {
      await tx
        .update(household)
        .set({ payerUserId: currentUser.id })
        .where(eq(household.id, profileHousehold.id));
    }

    // The player just confirmed "this is me" after seeing these exact values on the welcome
    // screen — the club's imported record wins over whatever was typed at sign-up.
    await tx
      .update(userTable)
      .set({ name: ghost.name, date_of_birth: ghost.date_of_birth })
      .where(eq(userTable.id, currentUser.id));

    // Clean up the ghost row only if nothing else still references it (it may be a member of
    // another club, or the payer of another household).
    const [otherMembership, otherProfile, otherHousehold] = await Promise.all([
      tx.select({ id: member.id }).from(member).where(eq(member.userId, ghost.id)).limit(1),
      tx
        .select({ id: clubMemberProfile.id })
        .from(clubMemberProfile)
        .where(eq(clubMemberProfile.userId, ghost.id))
        .limit(1),
      tx.select({ id: household.id }).from(household).where(eq(household.payerUserId, ghost.id)).limit(1),
    ]);
    if (otherMembership.length === 0 && otherProfile.length === 0 && otherHousehold.length === 0) {
      await tx.delete(userTable).where(eq(userTable.id, ghost.id));
    }
  });

  await invalidateUserClubIds(currentUser.id, ghost.id);

  return c.json({ success: true, organizationId: validated.organizationId });
};
