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

  const values = {
    licenseNumber: validated.licenseNumber ?? null,
    licenseValidUntil: validated.licenseValidUntil ? new Date(validated.licenseValidUntil) : null,
    phoneOverride: validated.phoneOverride ?? null,
    notes: validated.notes ?? null,
  };

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
