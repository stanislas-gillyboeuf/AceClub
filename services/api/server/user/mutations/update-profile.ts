import { Context } from "hono";
import { and, eq, ne } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, organization, user as userTable } from "../../../db/schema/auth/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { z } from "zod";
import { updateProfileValidator } from "../validators";
import { ulid } from "ulid";

const normalizePhoneNumber = (raw: string) => {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
};

export const updateProfile = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateProfileValidator>;

  // If organizationId is provided, verify it exists
  if (validated.organizationId) {
    const [org] = await db
      .select({ id: organization.id })
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
  }

  let updatedUserRow: typeof userTable.$inferSelect;
  try {
    updatedUserRow = await db.transaction(async (tx) => {
      // Update user table (name, image, phoneNumber)
      const userUpdateData: Record<string, unknown> = {};
      if (validated.name !== undefined) {
        userUpdateData.name = validated.name;
      }
      if (validated.image !== undefined) {
        userUpdateData.image = validated.image;
      }
      if (validated.phoneNumber !== undefined) {
        userUpdateData.phoneNumber = normalizePhoneNumber(validated.phoneNumber);
        userUpdateData.phoneNumberVerified = false;
      }

      let updated: typeof userTable.$inferSelect;
      if (Object.keys(userUpdateData).length > 0) {
        const [result] = await tx
          .update(userTable)
          .set(userUpdateData)
          .where(eq(userTable.id, authUser!.id))
          .returning();
        updated = result;
      } else {
        const [result] = await tx
          .select()
          .from(userTable)
          .where(eq(userTable.id, authUser!.id))
          .limit(1);
        updated = result;
      }

      // Update preferences if any preference field is provided
      if (validated.organizationId || validated.sport || validated.skillLevel) {
        const prefUpdateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (validated.organizationId) {
          prefUpdateData.organizationId = validated.organizationId;
        }
        if (validated.sport) {
          prefUpdateData.sport = validated.sport;
        }
        if (validated.skillLevel) {
          prefUpdateData.skillLevel = validated.skillLevel;
        }

        await tx
          .update(userPreference)
          .set(prefUpdateData)
          .where(eq(userPreference.userId, authUser!.id));

        // If organizationId changed, REPLACE user's organization membership (only one allowed)
        if (validated.organizationId) {
          // Remove user from ALL other organizations first
          await tx
            .delete(member)
            .where(
              and(
                eq(member.userId, authUser!.id),
                ne(member.organizationId, validated.organizationId),
              ),
            );

          // Check if user is already a member of the new organization
          const [existingMember] = await tx
            .select({ id: member.id })
            .from(member)
            .where(
              and(
                eq(member.organizationId, validated.organizationId),
                eq(member.userId, authUser!.id),
              ),
            )
            .limit(1);

          // Add to new organization if not already a member
          if (!existingMember) {
            await tx.insert(member).values({
              id: ulid(),
              organizationId: validated.organizationId,
              userId: authUser!.id,
              role: "member",
              createdAt: new Date(),
            });
          }
        }
      }

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
