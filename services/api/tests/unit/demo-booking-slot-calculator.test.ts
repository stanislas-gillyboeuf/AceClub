import { describe, it, expect } from "vitest";
import {
  computeAvailableSlots,
  type SlotCalculatorSettings,
} from "../../server/demo-booking/lib/slot-calculator";

const BASE_SETTINGS: SlotCalculatorSettings = {
  demoDurationMinutes: 20,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  minNoticeHours: 8,
  horizonDays: 0,
  maxPerDay: 10,
  referenceTimezone: "Europe/Paris",
};

// 2025-01-06 is a Monday; Paris is UTC+1 in January (no DST), so 08:00 UTC == 09:00 Paris.
const MONDAY_RULE = { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" };

describe("computeAvailableSlots", () => {
  it("generates fixed-duration slots across the rule window", () => {
    const now = new Date("2025-01-06T00:00:00Z"); // 01:00 Paris
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: BASE_SETTINGS,
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: [],
    });

    expect(slots.map((s) => s.start.toISOString())).toEqual([
      "2025-01-06T08:00:00.000Z",
      "2025-01-06T08:20:00.000Z",
      "2025-01-06T08:40:00.000Z",
    ]);
  });

  it("excludes a slot before the minimum notice window", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: { ...BASE_SETTINGS, minNoticeHours: 9 }, // earliest = 09:00Z = 10:00 Paris
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: [],
    });

    expect(slots).toHaveLength(0);
  });

  it("excludes a slot that has already passed", () => {
    const now = new Date("2025-01-06T09:00:00Z"); // well after the whole window
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: { ...BASE_SETTINGS, minNoticeHours: 0 },
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: [],
    });

    expect(slots).toHaveLength(0);
  });

  it("excludes a slot beyond the booking horizon", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const settings = { ...BASE_SETTINGS, horizonDays: 6 }; // next Monday falls outside
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings,
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: [],
    });

    // Only today's (day 0) 3 slots — day 7 (next Monday) is beyond horizonDays=6.
    expect(slots).toHaveLength(3);
  });

  it("applies the buffer directionally around an existing booking", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const rule = { dayOfWeek: 1, startTime: "09:00", endTime: "10:40" };
    const settings = { ...BASE_SETTINGS, bufferBeforeMinutes: 5, bufferAfterMinutes: 15 };
    // Busy 08:20-08:40Z: bufferBefore=5 protects back to 08:15 (blocks the 08:00 slot, which
    // ends at 08:20 with no gap), bufferAfter=15 protects forward to 08:55 (blocks the 08:40
    // slot) — only slots starting at/after 08:55 survive.
    const existingBookings = [
      { start: new Date("2025-01-06T08:20:00Z"), end: new Date("2025-01-06T08:40:00Z") },
    ];

    const slots = computeAvailableSlots({
      rules: [rule],
      settings,
      now,
      existingBookings,
      manualBlocks: [],
      googleBusy: [],
    });

    expect(slots.map((s) => s.start.toISOString())).toEqual([
      "2025-01-06T09:00:00.000Z",
      "2025-01-06T09:20:00.000Z",
    ]);
  });

  it("excludes slots conflicting with Google busy intervals", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const googleBusy = [
      { start: new Date("2025-01-06T08:20:00Z"), end: new Date("2025-01-06T08:40:00Z") },
    ];

    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: BASE_SETTINGS,
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy,
    });

    expect(slots.map((s) => s.start.toISOString())).toEqual([
      "2025-01-06T08:00:00.000Z",
      "2025-01-06T08:40:00.000Z",
    ]);
  });

  it("treats a null googleBusy (broken connection) as zero availability", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: BASE_SETTINGS,
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: null,
    });

    expect(slots).toHaveLength(0);
  });

  it("excludes slots on a whole-day manual block", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: BASE_SETTINGS,
      now,
      existingBookings: [],
      manualBlocks: [{ date: "2025-01-06", startAt: null, endAt: null }],
      googleBusy: [],
    });

    expect(slots).toHaveLength(0);
  });

  it("excludes slots inside a precise-range manual block", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: BASE_SETTINGS,
      now,
      existingBookings: [],
      manualBlocks: [
        {
          date: null,
          startAt: new Date("2025-01-06T08:00:00Z"),
          endAt: new Date("2025-01-06T08:20:00Z"),
        },
      ],
      googleBusy: [],
    });

    expect(slots.map((s) => s.start.toISOString())).toEqual([
      "2025-01-06T08:20:00.000Z",
      "2025-01-06T08:40:00.000Z",
    ]);
  });

  it("caps the number of slots per day", () => {
    const now = new Date("2025-01-06T00:00:00Z");
    const slots = computeAvailableSlots({
      rules: [MONDAY_RULE],
      settings: { ...BASE_SETTINGS, maxPerDay: 2 },
      now,
      existingBookings: [],
      manualBlocks: [],
      googleBusy: [],
    });

    expect(slots).toHaveLength(2);
  });
});
