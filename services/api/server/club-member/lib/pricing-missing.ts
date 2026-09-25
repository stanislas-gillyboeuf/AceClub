import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { memberCotisation } from "../../../db/schema";
import { loadActiveSeasonGrid } from "../../pricing/lib/active-season";
import { computeMemberBreakdown } from "../../pricing/lib/member-cotisation";

/**
 * The profile fields the pricing engine still needs for one member, for the member file banner.
 * `null` = nothing to show: no active grid, the member doesn't pay, the amount is already frozen
 * on an issued cotisation, or the live calculation failed (never break the member file for it).
 * An empty list means the price can be computed.
 */
export async function loadPricingMissingFields(
  organizationId: string,
  userId: string,
  isAdherent: boolean,
): Promise<string[] | null> {
  if (!isAdherent) return null;

  try {
    const grid = await loadActiveSeasonGrid(organizationId);
    if (!grid) return null;

    const [issued] = await db
      .select({ id: memberCotisation.id })
      .from(memberCotisation)
      .where(
        and(
          eq(memberCotisation.organizationId, organizationId),
          eq(memberCotisation.userId, userId),
          eq(memberCotisation.seasonLabel, grid.seasonLabel),
        ),
      )
      .limit(1);
    if (issued) return null;

    const result = await computeMemberBreakdown(organizationId, userId, grid.seasonLabel);
    if ("error" in result) return null;
    return result.breakdown.status === "incomplete" ? result.breakdown.missingFields : [];
  } catch {
    return null;
  }
}
