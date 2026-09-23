import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateClubMemberProfileValidator } from "../validators";

export const updateClubMemberProfile = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateClubMemberProfileValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const values: Partial<typeof clubMemberProfile.$inferInsert> = {
    licenseNumber: validated.licenseNumber ?? null,
    licenseValidUntil: validated.licenseValidUntil ? new Date(validated.licenseValidUntil) : null,
    medicalCertificateValidUntil: validated.medicalCertificateValidUntil
      ? new Date(validated.medicalCertificateValidUntil)
      : null,
    phoneOverride: validated.phoneOverride ?? null,
    notes: validated.notes ?? null,
    city: validated.city ?? null,
    isVip: validated.isVip ?? false,
  };

  // Pricing-engine fields: only touch a column when the caller actually sent it (present in the
  // validated body, even if explicitly null), so a partial save from one part of the UI never
  // silently wipes data entered elsewhere.
  if ("licensedElsewhere" in validated) values.licensedElsewhere = validated.licensedElsewhere;
  if ("householdRank" in validated) values.householdRank = validated.householdRank;
  if ("communeInsee" in validated) values.communeInsee = validated.communeInsee;
  if ("communeName" in validated) values.communeName = validated.communeName;

  const [profile] = await db
    .insert(clubMemberProfile)
    .values({
      id: ulid(),
      userId: validated.userId,
      organizationId: validated.organizationId,
      ...values,
    })
    .onConflictDoUpdate({
      target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
      set: values,
    })
    .returning();

  return c.json(profile);
};
