import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { tarifGrid, memberCotisation } from "../../../db/schema";
import type { MemberCotisation } from "../../../db/schema";
import { computeCotisation, type Breakdown } from "./engine";
import { buildGridSnapshot } from "./snapshot";
import { loadOrgMemberProfiles } from "./member-profile-adapter";

export type ComputeMemberBreakdownResult =
  | { gridId: string; breakdown: Breakdown; memberName: string; memberEmail: string }
  | { error: "no_active_grid" | "member_not_found" };

/** Live-computes one member's breakdown against the org's active grid for a season — never
 * writes to the DB. Reuses `loadOrgMemberProfiles` (an org-wide batch load) and filters to one
 * member rather than a bespoke single-row query — clubs here are small, and this keeps the
 * profile-building logic in exactly one place. */
export async function computeMemberBreakdown(
  organizationId: string,
  userId: string,
  seasonLabel: string,
): Promise<ComputeMemberBreakdownResult> {
  const [grid] = await db
    .select()
    .from(tarifGrid)
    .where(
      and(
        eq(tarifGrid.organizationId, organizationId),
        eq(tarifGrid.seasonLabel, seasonLabel),
        eq(tarifGrid.status, "active"),
      ),
    )
    .limit(1);

  if (!grid) return { error: "no_active_grid" };

  const snapshot = await buildGridSnapshot(grid.id);
  const members = await loadOrgMemberProfiles(organizationId, snapshot);
  const found = members.find((m) => m.userId === userId);
  if (!found) return { error: "member_not_found" };

  const breakdown = computeCotisation(snapshot, found.profile);
  return { gridId: grid.id, breakdown, memberName: found.name, memberEmail: found.email };
}

export type EnsureMemberCotisationResult =
  | { record: MemberCotisation }
  | { error: "no_active_grid" | "member_not_found" | "incomplete"; missingFields?: string[] };

/**
 * Returns the member's cotisation record for a season, creating it on first use. Once a record
 * exists its amountCents/breakdownSnapshot are FROZEN — this never recomputes an existing record,
 * even if the grid changes afterwards, so a receipt or a "paid" status always reflects what was
 * actually charged at the time.
 */
export async function ensureMemberCotisationRecord(
  organizationId: string,
  userId: string,
  seasonLabel: string,
): Promise<EnsureMemberCotisationResult> {
  const [existing] = await db
    .select()
    .from(memberCotisation)
    .where(
      and(
        eq(memberCotisation.organizationId, organizationId),
        eq(memberCotisation.userId, userId),
        eq(memberCotisation.seasonLabel, seasonLabel),
      ),
    )
    .limit(1);

  if (existing) return { record: existing };

  const result = await computeMemberBreakdown(organizationId, userId, seasonLabel);
  if ("error" in result) return result;

  const { gridId, breakdown } = result;
  if (breakdown.status === "incomplete") {
    return { error: "incomplete", missingFields: breakdown.missingFields };
  }

  const [created] = await db
    .insert(memberCotisation)
    .values({
      organizationId,
      userId,
      tarifGridId: gridId,
      seasonLabel,
      amountCents: breakdown.totalCents,
      breakdownSnapshot: breakdown,
      status: "pending",
    })
    .returning();

  return { record: created };
}
