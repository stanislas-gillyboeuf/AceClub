// Pure slot computation (no I/O) so it can be unit-tested in isolation.
import { zonedDateTime, dateStringInTimeZone, addDaysToDateString, weekdayOfDateString } from "./timezone";

export interface AvailabilityRuleInput {
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface SlotCalculatorSettings {
  demoDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeHours: number;
  horizonDays: number;
  maxPerDay: number;
  referenceTimezone: string;
}

export interface BusyRange {
  start: Date;
  end: Date;
}

export interface ManualBlockInput {
  date: string | null; // whole-day block, "YYYY-MM-DD"
  startAt: Date | null;
  endAt: Date | null;
}

export interface ComputeAvailableSlotsParams {
  rules: AvailabilityRuleInput[];
  settings: SlotCalculatorSettings;
  now: Date;
  existingBookings: BusyRange[];
  manualBlocks: ManualBlockInput[];
  /** null means the Google connection is broken/unreliable — callers must treat this as "no slots". */
  googleBusy: BusyRange[] | null;
}

export interface Slot {
  start: Date;
  end: Date;
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function overlapsWithBuffer(
  slot: Slot,
  busy: BusyRange,
  bufferBeforeMs: number,
  bufferAfterMs: number,
): boolean {
  const expandedStart = busy.start.getTime() - bufferBeforeMs;
  const expandedEnd = busy.end.getTime() + bufferAfterMs;
  return slot.start.getTime() < expandedEnd && slot.end.getTime() > expandedStart;
}

function conflictsWithRanges(
  slot: Slot,
  ranges: BusyRange[],
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): boolean {
  const bufferBeforeMs = bufferBeforeMinutes * 60 * 1000;
  const bufferAfterMs = bufferAfterMinutes * 60 * 1000;
  return ranges.some((range) => overlapsWithBuffer(slot, range, bufferBeforeMs, bufferAfterMs));
}

function conflictsWithManualBlocks(
  slot: Slot,
  dateString: string,
  manualBlocks: ManualBlockInput[],
): boolean {
  return manualBlocks.some((block) => {
    if (block.date) return block.date === dateString;
    if (block.startAt && block.endAt) {
      return slot.start.getTime() < block.endAt.getTime() && slot.end.getTime() > block.startAt.getTime();
    }
    return false;
  });
}

export function computeAvailableSlots(params: ComputeAvailableSlotsParams): Slot[] {
  if (params.googleBusy === null) return [];

  const { rules, settings, now, existingBookings, manualBlocks, googleBusy } = params;
  const earliestStartMs = now.getTime() + settings.minNoticeHours * 60 * 60 * 1000;
  const todayDate = dateStringInTimeZone(now, settings.referenceTimezone);

  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset <= settings.horizonDays; dayOffset++) {
    const dateString = addDaysToDateString(todayDate, dayOffset);
    const weekday = weekdayOfDateString(dateString);
    const rulesForDay = rules.filter((r) => r.dayOfWeek === weekday);

    let daySlots: Slot[] = [];
    for (const rule of rulesForDay) {
      const endMinutes = parseHHMM(rule.endTime);
      for (
        let cursor = parseHHMM(rule.startTime);
        cursor + settings.demoDurationMinutes <= endMinutes;
        cursor += settings.demoDurationMinutes
      ) {
        const start = zonedDateTime(dateString, minutesToHHMM(cursor), settings.referenceTimezone);
        const end = new Date(start.getTime() + settings.demoDurationMinutes * 60 * 1000);
        daySlots.push({ start, end });
      }
    }

    daySlots = daySlots.filter((s) => s.start.getTime() >= earliestStartMs);
    daySlots = daySlots.filter(
      (s) => !conflictsWithRanges(s, existingBookings, settings.bufferBeforeMinutes, settings.bufferAfterMinutes),
    );
    daySlots = daySlots.filter((s) => !conflictsWithManualBlocks(s, dateString, manualBlocks));
    daySlots = daySlots.filter(
      (s) => !conflictsWithRanges(s, googleBusy, settings.bufferBeforeMinutes, settings.bufferAfterMinutes),
    );

    if (settings.maxPerDay > 0) {
      daySlots = daySlots.slice(0, settings.maxPerDay);
    }

    slots.push(...daySlots);
  }

  return slots;
}
