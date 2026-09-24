import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { tarifGrid, memberCotisation, organization } from "../../../db/schema";
import type { HonoContext } from "../../../types/hono";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { computeCotisation } from "../lib/engine";
import { buildGridSnapshot } from "../lib/snapshot";
import { loadOrgMemberProfiles } from "../lib/member-profile-adapter";
import { sendCotisationRequest } from "../lib/issue-email";
import { issueAllCotisationsValidator } from "../validators";

const EMAIL_BATCH_SIZE = 5;

/** "Émettre et envoyer à tous": issues every adherent who has no record yet and whose price can be
 * computed. Grid and profiles are loaded ONCE (not per member). Incomplete profiles are skipped
 * and reported; an email failure never blocks a record's creation. */
export const issueAllCotisations = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof issueAllCotisationsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [grid] = await db
    .select()
    .from(tarifGrid)
    .where(
      and(
        eq(tarifGrid.organizationId, validated.organizationId),
        eq(tarifGrid.seasonLabel, validated.seasonLabel),
        eq(tarifGrid.status, "active"),
      ),
    )
    .limit(1);
  if (!grid) {
    return c.json({ error: "NotFound", message: "No active pricing grid for this season" }, 404);
  }

  const [snapshot, existing, [orgRow]] = await Promise.all([
    buildGridSnapshot(grid.id),
    db
      .select({ userId: memberCotisation.userId })
      .from(memberCotisation)
      .where(
        and(
          eq(memberCotisation.organizationId, validated.organizationId),
          eq(memberCotisation.seasonLabel, validated.seasonLabel),
        ),
      ),
    db.select({ name: organization.name }).from(organization).where(eq(organization.id, validated.organizationId)).limit(1),
  ]);
  const alreadyIssued = new Set(existing.map((r) => r.userId));
  const profiles = await loadOrgMemberProfiles(validated.organizationId, snapshot, validated.seasonLabel);

  const skippedIncomplete: { userId: string; name: string; missingFields: string[] }[] = [];
  const toIssue: {
    userId: string;
    name: string;
    email: string;
    amountCents: number;
    breakdown: object;
    householdRank: number | null;
  }[] = [];

  for (const { userId, name, email, isAdherent, profile } of profiles) {
    if (alreadyIssued.has(userId)) continue;
    // Owner/admin/coach don't pay unless explicitly flagged as adherents.
    if (!isAdherent) continue;
    const breakdown = computeCotisation(snapshot, profile);
    if (breakdown.status === "incomplete") {
      skippedIncomplete.push({ userId, name, missingFields: breakdown.missingFields });
      continue;
    }
    toIssue.push({
      userId,
      name,
      email,
      amountCents: breakdown.totalCents,
      breakdown,
      householdRank: profile.householdRank ?? null,
    });
  }

  const now = new Date();
  const inserted = toIssue.length
    ? await db
        .insert(memberCotisation)
        .values(
          toIssue.map((m) => ({
            organizationId: validated.organizationId,
            userId: m.userId,
            tarifGridId: grid.id,
            seasonLabel: validated.seasonLabel,
            amountCents: m.amountCents,
            breakdownSnapshot: m.breakdown,
            status: "pending" as const,
            householdRankFrozen: m.householdRank,
            issuedAt: now,
          })),
        )
        .onConflictDoNothing()
        .returning({ userId: memberCotisation.userId })
    : [];

  const insertedIds = new Set(inserted.map((r) => r.userId));
  const created = toIssue.filter((m) => insertedIds.has(m.userId));

  const emailFailed: { userId: string; name: string; email: string; reason: string }[] = [];
  for (let i = 0; i < created.length; i += EMAIL_BATCH_SIZE) {
    const batch = created.slice(i, i + EMAIL_BATCH_SIZE);
    const results = await Promise.all(
      batch.map((m) =>
        sendCotisationRequest({
          clubName: orgRow?.name ?? "",
          memberName: m.name,
          memberEmail: m.email,
          seasonLabel: validated.seasonLabel,
          amountCents: m.amountCents,
        }),
      ),
    );
    results.forEach((res, idx) => {
      if (!res.sent) {
        const m = batch[idx];
        emailFailed.push({ userId: m.userId, name: m.name, email: m.email, reason: res.reason });
      }
    });
  }

  return c.json({ issued: created.length, skippedIncomplete, emailFailed });
};
