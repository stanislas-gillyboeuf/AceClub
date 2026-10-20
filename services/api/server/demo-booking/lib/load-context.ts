import { and, eq, gt, ne } from "drizzle-orm";
import { db } from "../../../db";
import { demoBooking, demoManualBlock } from "../../../db/schema";
import { getDemoAvailabilityRules, getDemoBookingSettings } from "./settings";
import { getActiveGoogleConnection, markGoogleConnectionError } from "./google-connection";
import { getFreeBusy, GoogleCalendarAuthError, type BusyInterval } from "../../../lib/google-calendar";
import { cached, CacheKeys, CacheTTL } from "../../../lib/cache";
import type {
  AvailabilityRuleInput,
  BusyRange,
  ManualBlockInput,
  SlotCalculatorSettings,
} from "./slot-calculator";

export interface SlotComputationContext {
  rules: AvailabilityRuleInput[];
  settings: SlotCalculatorSettings;
  now: Date;
  existingBookings: BusyRange[];
  manualBlocks: ManualBlockInput[];
  googleBusy: BusyRange[] | null;
}

async function loadGoogleBusy(now: Date, horizonEnd: Date): Promise<BusyRange[] | null> {
  const connection = await getActiveGoogleConnection();
  if (!connection) return null;

  try {
    const intervals = await cached<BusyInterval[]>(
      CacheKeys.demoGcalBusy(),
      CacheTTL.DEMO_GCAL_BUSY,
      () => getFreeBusy(connection.refreshToken, connection.calendarId, now, horizonEnd),
    );
    return intervals.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  } catch (error) {
    if (error instanceof GoogleCalendarAuthError) {
      await markGoogleConnectionError(error.message);
    }
    return null;
  }
}

export async function loadSlotComputationContext(
  /** Excludes this booking's own occupied window — used when rescheduling it, so its current
   * slot (and buffer around it) doesn't make itself look unavailable. */
  excludeBookingId?: string,
): Promise<SlotComputationContext> {
  const now = new Date();
  const settings = await getDemoBookingSettings();
  const rules = await getDemoAvailabilityRules();
  const horizonEnd = new Date(now.getTime() + settings.horizonDays * 24 * 60 * 60 * 1000);

  const bookingRows = await db
    .select({ startAt: demoBooking.startAt, endAt: demoBooking.endAt })
    .from(demoBooking)
    .where(
      and(
        eq(demoBooking.status, "confirmed"),
        gt(demoBooking.endAt, now),
        excludeBookingId ? ne(demoBooking.id, excludeBookingId) : undefined,
      ),
    );
  const existingBookings: BusyRange[] = bookingRows.map((b) => ({ start: b.startAt, end: b.endAt }));

  const blockRows = await db
    .select({
      date: demoManualBlock.date,
      startAt: demoManualBlock.startAt,
      endAt: demoManualBlock.endAt,
    })
    .from(demoManualBlock);
  const manualBlocks: ManualBlockInput[] = blockRows;

  const googleBusy = await loadGoogleBusy(now, horizonEnd);

  return { rules, settings, now, existingBookings, manualBlocks, googleBusy };
}
