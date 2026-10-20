import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { demoBookingSettings, demoAvailabilityRule } from "../../../db/schema";
import type { SlotCalculatorSettings } from "./slot-calculator";

export const DEFAULT_DEMO_BOOKING_SETTINGS: SlotCalculatorSettings = {
  demoDurationMinutes: 20,
  bufferBeforeMinutes: 10,
  bufferAfterMinutes: 10,
  minNoticeHours: 8,
  horizonDays: 21,
  maxPerDay: 3,
  referenceTimezone: "Europe/Paris",
};

export async function getDemoBookingSettings(): Promise<SlotCalculatorSettings> {
  const [row] = await db
    .select()
    .from(demoBookingSettings)
    .where(eq(demoBookingSettings.id, "singleton"))
    .limit(1);

  if (!row) return DEFAULT_DEMO_BOOKING_SETTINGS;

  return {
    demoDurationMinutes: row.demoDurationMinutes,
    bufferBeforeMinutes: row.bufferBeforeMinutes,
    bufferAfterMinutes: row.bufferAfterMinutes,
    minNoticeHours: row.minNoticeHours,
    horizonDays: row.horizonDays,
    maxPerDay: row.maxPerDay,
    referenceTimezone: row.referenceTimezone,
  };
}

export async function getDemoAvailabilityRules(): Promise<
  { dayOfWeek: number; startTime: string; endTime: string }[]
> {
  const rows = await db
    .select({
      dayOfWeek: demoAvailabilityRule.dayOfWeek,
      startTime: demoAvailabilityRule.startTime,
      endTime: demoAvailabilityRule.endTime,
    })
    .from(demoAvailabilityRule);
  return rows;
}
