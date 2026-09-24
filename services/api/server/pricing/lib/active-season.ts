import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";

/** paymentDueDate of the active grid for each season of a club, keyed by seasonLabel. Read from
 * the ACTIVE version so editing the deadline applies to cotisations issued under older versions. */
export async function loadSeasonPaymentDueDates(organizationId: string): Promise<Map<string, Date | null>> {
  const grids = await db
    .select({ seasonLabel: tarifGrid.seasonLabel, paymentDueDate: tarifGrid.paymentDueDate })
    .from(tarifGrid)
    .where(and(eq(tarifGrid.organizationId, organizationId), eq(tarifGrid.status, "active")));
  return new Map(grids.map((g) => [g.seasonLabel, g.paymentDueDate]));
}

/** The club's current season: the active grid whose period contains `now`, else the most
 * recently started active grid. */
export async function loadActiveSeasonGrid(organizationId: string, now: Date = new Date()) {
  const grids = await db
    .select({
      id: tarifGrid.id,
      seasonLabel: tarifGrid.seasonLabel,
      seasonStartDate: tarifGrid.seasonStartDate,
      seasonEndDate: tarifGrid.seasonEndDate,
      paymentDueDate: tarifGrid.paymentDueDate,
    })
    .from(tarifGrid)
    .where(and(eq(tarifGrid.organizationId, organizationId), eq(tarifGrid.status, "active")))
    .orderBy(desc(tarifGrid.seasonStartDate));

  return (
    grids.find((g) => g.seasonStartDate <= now && now <= g.seasonEndDate) ?? grids[0] ?? null
  );
}
