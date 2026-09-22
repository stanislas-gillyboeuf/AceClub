import { Context } from "hono";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member, clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { auth } from "../../../auth";
import { addMemberValidator } from "../validators";

function generatePassword(): string {
  // base64url, no padding — 18 random bytes -> 24 chars, well above better-auth's minimum.
  return randomBytes(18).toString("base64url");
}

// Single-member counterpart to bulk-import.ts — same ghost-user-if-not-found logic, for the
// "Ajouter un membre" form rather than a CSV. Optionally assigns a club role other than
// "member" and/or generates a login password (returned once in the response) so an admin/coach
// created here can sign in directly instead of waiting to self-claim the ghost profile.
export const addMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin && currentUser.role !== "admin") {
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
      role: validated.role,
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

  let generatedPassword: string | null = null;
  if (validated.generatePassword) {
    generatedPassword = generatePassword();
    // Also flips user.is_ghost to false via the account.create.after database hook in auth.ts.
    await auth.api.setUserPassword({
      body: { userId: result.userId, newPassword: generatedPassword },
      headers: c.req.raw.headers,
    });
  }

  return c.json({ success: true, userId: result.userId, generatedPassword }, 201);
};
