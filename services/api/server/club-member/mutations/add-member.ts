import { Context } from "hono";
import { z } from "zod";
import { randomInt } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { hashPassword } from "better-auth/crypto";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member, clubMemberProfile, account } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { addMemberValidator } from "../validators";

// Excludes visually-ambiguous characters (0/O, 1/l/I) — this is a one-time temp password the
// admin has to read out or type once, and the person must change it on first login anyway.
const PASSWORD_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generatePassword(): string {
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  }
  return result;
}

// Single-member counterpart to bulk-import.ts — same ghost-user-if-not-found logic, for the
// "Ajouter un membre" form rather than a CSV. Optionally assigns a club role other than
// "member" and/or generates a login password (returned once in the response) so an admin/coach
// created here can sign in directly instead of waiting to self-claim the ghost profile.
//
// Deliberately does NOT use auth.api.setUserPassword: that endpoint only UPDATEs an existing
// "credential" account row (internalAdapter.updatePassword does a plain WHERE userId=...
// AND providerId='credential' update) — for a fresh ghost user with no account row at all it
// silently matches zero rows and returns {status:true} without ever setting a usable password.
// Creating the account row ourselves (matching better-auth's own linkAccount shape, used by its
// createUser endpoint) is what actually makes the account loggable-into, and still fires the
// account.create.after hook in auth.ts that flips user.is_ghost to false.
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
    const hashed = await hashPassword(generatedPassword);

    const [existingAccount] = await db
      .select({ id: account.id })
      .from(account)
      .where(and(eq(account.userId, result.userId), eq(account.providerId, "credential")))
      .limit(1);

    if (existingAccount) {
      await db.update(account).set({ password: hashed }).where(eq(account.id, existingAccount.id));
    } else {
      await db.insert(account).values({
        id: ulid(),
        accountId: result.userId,
        providerId: "credential",
        userId: result.userId,
        password: hashed,
      });
    }

    await db
      .update(user)
      .set({ is_ghost: false, must_change_password: true })
      .where(eq(user.id, result.userId));
  }

  return c.json({ success: true, userId: result.userId, generatedPassword }, 201);
};
