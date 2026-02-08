import { Context } from "hono";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, organization, user as userTable } from "../../../db/schema/auth/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { z } from "zod";
import { completeOnboardingValidator } from "../validators";
import { ulid } from "ulid";

const normalizePhoneNumber = (raw: string) => {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
};

export const completeOnboarding = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof completeOnboardingValidator>;

  const [org] = await db
    .select({
      id: organization.id,
      pin: organization.pin,
      pinEnabled: organization.pinEnabled,
    })
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!org) {
    return c.json(
      {
        error: "Not found",
        message: "Organization not found",
      },
      404,
    );
  }

  if (org.pinEnabled && org.pin && validated.pin !== org.pin) {
    return c.json(
      {
        error: "InvalidPin",
        message: "Code PIN incorrect",
      },
      403,
    );
  }

  let updatedUserRow: typeof userTable.$inferSelect;
  try {
    updatedUserRow = await db.transaction(async (tx) => {
      await tx
        .insert(userPreference)
        .values({
          userId: authUser!.id,
          organizationId: validated.organizationId,
          sport: validated.sport,
          skillLevel: validated.skillLevel,
        })
        .onConflictDoUpdate({
          target: userPreference.userId,
          set: {
            organizationId: validated.organizationId,
            sport: validated.sport,
            skillLevel: validated.skillLevel,
            updatedAt: new Date(),
          },
        });

      const [existingMember] = await tx
        .select({ id: member.id })
        .from(member)
        .where(
          and(eq(member.organizationId, validated.organizationId), eq(member.userId, authUser!.id)),
        )
        .limit(1);

      if (!existingMember) {
        await tx.insert(member).values({
          id: ulid(),
          organizationId: validated.organizationId,
          userId: authUser!.id,
          role: "member",
          createdAt: new Date(),
        });
      }

      const phoneNumber = normalizePhoneNumber(validated.phoneNumber);

      const [updated] = await tx
        .update(userTable)
        .set({ onboarding_completed: true, phoneNumber, phoneNumberVerified: false })
        .where(eq(userTable.id, authUser!.id))
        .returning();

      return updated;
    });
  } catch (error) {
    const err = error as { code?: string };
    // Postgres unique_violation
    if (err?.code === "23505") {
      return c.json(
        {
          error: "Conflict",
          message: "Phone number already in use",
        },
        409,
      );
    }
    throw error;
  }

  return c.json({
    id: updatedUserRow.id,
    name: updatedUserRow.name,
    email: updatedUserRow.email,
    emailVerified: updatedUserRow.emailVerified,
    image: updatedUserRow.image,
    createdAt: updatedUserRow.createdAt,
    updatedAt: updatedUserRow.updatedAt,
    role: updatedUserRow.role,
    banned: updatedUserRow.banned,
    banReason: updatedUserRow.banReason,
    banExpires: updatedUserRow.banExpires,
    onboardingCompleted: updatedUserRow.onboarding_completed,
    phoneNumber: updatedUserRow.phoneNumber,
  });
};
