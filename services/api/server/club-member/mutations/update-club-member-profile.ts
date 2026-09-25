import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { updateClubMemberProfileValidator } from "../validators";

export const updateClubMemberProfile = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateClubMemberProfileValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (!(await isOrgMember(validated.userId, validated.organizationId))) {
    return c.json({ error: "NotFound", message: "Member not found in this club" }, 404);
  }

  // Every column is written only when the caller actually sent it (present in the validated body,
  // even if explicitly null), so a partial save from one part of the UI never silently wipes
  // data entered elsewhere (notes and city used to be reset to null on every save).
  const values: Partial<typeof clubMemberProfile.$inferInsert> = {};
  if ("licenseNumber" in validated) values.licenseNumber = validated.licenseNumber ?? null;
  if ("licenseValidUntil" in validated) {
    values.licenseValidUntil = validated.licenseValidUntil ? new Date(validated.licenseValidUntil) : null;
  }
  if ("medicalCertificateValidUntil" in validated) {
    values.medicalCertificateValidUntil = validated.medicalCertificateValidUntil
      ? new Date(validated.medicalCertificateValidUntil)
      : null;
  }
  if ("phoneOverride" in validated) values.phoneOverride = validated.phoneOverride ?? null;
  if ("notes" in validated) values.notes = validated.notes ?? null;
  if ("city" in validated) values.city = validated.city ?? null;
  if ("isVip" in validated && validated.isVip !== undefined) values.isVip = validated.isVip;
  if ("licensedElsewhere" in validated) values.licensedElsewhere = validated.licensedElsewhere;
  if ("householdRank" in validated) values.householdRank = validated.householdRank;
  if ("communeInsee" in validated) values.communeInsee = validated.communeInsee;
  if ("communeName" in validated) values.communeName = validated.communeName;
  if ("dateOfBirth" in validated) values.dateOfBirth = validated.dateOfBirth;
  if ("isAdherent" in validated) values.isAdherent = validated.isAdherent;
  if ("isNewMember" in validated) values.isNewMember = validated.isNewMember;

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
      // Drizzle refuses an empty `set`; a no-field call just touches the row.
      set: Object.keys(values).length > 0 ? values : { updatedAt: new Date() },
    })
    .returning();

  return c.json(profile);
};
