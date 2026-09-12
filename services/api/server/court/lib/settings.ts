import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { courtSettings } from "../../../db/schema";

export interface ResolvedCourtSettings {
  openingHour: number;
  closingHour: number;
  maxBookingsPerWeekWeekday: number | null;
  maxBookingsPerWeekWeekend: number | null;
  bookingWindowDays: number | null;
}

export const DEFAULT_COURT_SETTINGS: ResolvedCourtSettings = {
  openingHour: 8,
  closingHour: 22,
  maxBookingsPerWeekWeekday: null,
  maxBookingsPerWeekWeekend: null,
  bookingWindowDays: null,
};

export async function getCourtSettings(organizationId: string): Promise<ResolvedCourtSettings> {
  const [settings] = await db
    .select({
      openingHour: courtSettings.openingHour,
      closingHour: courtSettings.closingHour,
      maxBookingsPerWeekWeekday: courtSettings.maxBookingsPerWeekWeekday,
      maxBookingsPerWeekWeekend: courtSettings.maxBookingsPerWeekWeekend,
      bookingWindowDays: courtSettings.bookingWindowDays,
    })
    .from(courtSettings)
    .where(eq(courtSettings.organizationId, organizationId))
    .limit(1);

  return settings ?? DEFAULT_COURT_SETTINGS;
}
