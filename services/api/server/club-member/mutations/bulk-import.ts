import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, member, clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { bulkImportValidator } from "../validators";

export const bulkImport = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof bulkImportValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  let created = 0;
  let updated = 0;
  const skipped: { row: number; reason: string }[] = [];
  const seenEmails = new Set<string>();

  await db.transaction(async (tx) => {
    for (let i = 0; i < validated.rows.length; i++) {
      const row = validated.rows[i];
      const email = row.email.toLowerCase();

      if (seenEmails.has(email)) {
        skipped.push({ row: i, reason: "Email en double dans le fichier" });
        continue;
      }
      seenEmails.add(email);

      const [existingUser] = await tx
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        updated++;
      } else {
        const [createdUser] = await tx
          .insert(user)
          .values({
            id: ulid(),
            name: row.name,
            email,
            emailVerified: false,
            is_ghost: true,
            date_of_birth: row.dateOfBirth,
          })
          .returning({ id: user.id });
        userId = createdUser.id;
        created++;
      }

      const [existingMember] = await tx
        .select({ id: member.id })
        .from(member)
        .where(and(eq(member.organizationId, validated.organizationId), eq(member.userId, userId)))
        .limit(1);

      if (!existingMember) {
        await tx.insert(member).values({
          id: ulid(),
          organizationId: validated.organizationId,
          userId,
          role: "member",
          createdAt: new Date(),
        });
      }

      if (row.licenseNumber || row.licenseValidUntil || row.phone) {
        await tx
          .insert(clubMemberProfile)
          .values({
            id: ulid(),
            userId,
            organizationId: validated.organizationId,
            licenseNumber: row.licenseNumber ?? null,
            licenseValidUntil: row.licenseValidUntil ? new Date(row.licenseValidUntil) : null,
            phoneOverride: row.phone ?? null,
          })
          .onConflictDoUpdate({
            target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
            set: {
              licenseNumber: row.licenseNumber ?? null,
              licenseValidUntil: row.licenseValidUntil ? new Date(row.licenseValidUntil) : null,
              phoneOverride: row.phone ?? null,
            },
          });
      }
    }
  });

  return c.json({ created, updated, skipped });
};
