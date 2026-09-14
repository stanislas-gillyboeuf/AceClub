import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { vacationPeriod } from "../../../db/schema";

export interface VacationDateRange {
  startDate: string;
  endDate: string;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Shared by the vacation-period CRUD handlers and course occurrence generation — every
 * closure period for the org, as plain "YYYY-MM-DD" date strings. */
export async function getVacationDateRanges(organizationId: string): Promise<VacationDateRange[]> {
  const rows = await db
    .select({ startDate: vacationPeriod.startDate, endDate: vacationPeriod.endDate })
    .from(vacationPeriod)
    .where(eq(vacationPeriod.organizationId, organizationId));

  return rows.map((r) => ({ startDate: toDateString(r.startDate), endDate: toDateString(r.endDate) }));
}
