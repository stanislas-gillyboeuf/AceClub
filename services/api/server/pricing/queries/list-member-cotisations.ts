import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, memberCotisation } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { computeCotisation, type Breakdown } from "../lib/engine";
import { buildGridSnapshot } from "../lib/snapshot";
import { loadOrgMemberProfiles } from "../lib/member-profile-adapter";
import { listMemberCotisationsValidator } from "../validators";

export type MemberCotisationStatusView = "not_generated" | "pending" | "paid" | "waived";

export const listMemberCotisations = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listMemberCotisationsValidator>;

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
    return c.json({ gridId: null, seasonLabel: validated.seasonLabel, members: [] });
  }

  const [snapshot, existingRecords] = await Promise.all([
    buildGridSnapshot(grid.id),
    db
      .select()
      .from(memberCotisation)
      .where(
        and(
          eq(memberCotisation.organizationId, validated.organizationId),
          eq(memberCotisation.seasonLabel, validated.seasonLabel),
        ),
      ),
  ]);

  const recordByUserId = new Map(existingRecords.map((r) => [r.userId, r]));
  const memberProfiles = await loadOrgMemberProfiles(validated.organizationId, snapshot);

  const members = memberProfiles
    .map(({ userId, name, email, profile }) => {
      const record = recordByUserId.get(userId);
      if (record) {
        return {
          userId,
          name,
          email,
          amountCents: record.amountCents,
          status: record.status as MemberCotisationStatusView,
          breakdown: record.breakdownSnapshot as Breakdown,
          recordId: record.id,
        };
      }
      const breakdown = computeCotisation(snapshot, profile);
      return {
        userId,
        name,
        email,
        amountCents: breakdown.status === "complete" ? breakdown.totalCents : null,
        status: "not_generated" as MemberCotisationStatusView,
        breakdown,
        recordId: null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return c.json({ gridId: grid.id, seasonLabel: validated.seasonLabel, members });
};
