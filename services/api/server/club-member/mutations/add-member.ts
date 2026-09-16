import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member, clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { addMemberValidator } from "../validators";

// Single-member counterpart to bulk-import.ts — same ghost-user-if-not-found logic, for the
// "Ajouter un membre" form rather than a CSV.
export const addMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const email = validated.email.toLowerCase();

  const result = await db.transaction(async (tx) => {
    const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const [createdUser] = await tx
        .insert(user)
        .values({ id: ulid(), name: validated.name, email, emailVerified: false, is_ghost: true })
        .returning({ id: user.id });
      userId = createdUser.id;
    }

    const [existingMember] = await tx
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.organizationId, validated.organizationId), eq(member.userId, userId)))
      .limit(1);

    if (existingMember) {
      return { conflict: true as const };
    }

    await tx.insert(member).values({
      id: ulid(),
      organizationId: validated.organizationId,
      userId,
      role: "member",
      createdAt: new Date(),
    });

    if (validated.phone) {
      await tx
        .insert(clubMemberProfile)
        .values({
          userId,
          organizationId: validated.organizationId,
          phoneOverride: validated.phone,
        })
        .onConflictDoUpdate({
          target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
          set: { phoneOverride: validated.phone },
        });
    }

    return { conflict: false as const, userId };
  });

  if (result.conflict) {
    return c.json({ error: "Conflict", message: "This person is already a member of this club" }, 409);
  }

  return c.json({ success: true, userId: result.userId }, 201);
};
