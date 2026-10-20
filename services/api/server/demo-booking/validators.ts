import { z } from "zod";
import { demoBookingRole } from "../../db/schema";

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be in HH:mm format");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format");

export const availabilityQueryValidator = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
});

export const slotsQueryValidator = z.object({
  date: isoDate,
});

export const createDemoBookingValidator = z.object({
  startAt: z.string().datetime("Invalid start date"),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  clubName: z.string().min(1).max(120),
  phone: z.string().max(30).optional(),
  role: z.enum(demoBookingRole),
  note: z.string().max(1000).optional(),
  utmSource: z.string().max(120).optional(),
  // Honeypot: real visitors never fill this (hidden field) — a non-empty value is handled as a
  // silent fake-success in the mutation, never surfaced as a validation error.
  website: z.string().optional().default(""),
});

export const rescheduleDemoBookingValidator = z.object({
  startAt: z.string().datetime("Invalid start date"),
});

export const noSlotContactValidator = z.object({
  email: z.string().email(),
});

export const updateDemoBookingSettingsValidator = z.object({
  demoDurationMinutes: z.number().int().min(5).max(120),
  bufferBeforeMinutes: z.number().int().min(0).max(120),
  bufferAfterMinutes: z.number().int().min(0).max(120),
  minNoticeHours: z.number().int().min(0).max(240),
  horizonDays: z.number().int().min(1).max(180),
  maxPerDay: z.number().int().min(0).max(50),
  referenceTimezone: z.string().min(1),
  rules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: timeOfDay,
      endTime: timeOfDay,
    }),
  ),
});

export const listDemoBookingsValidator = z.object({
  upcoming: z.coerce.boolean().optional().default(true),
});

export const exchangeGoogleCodeValidator = z.object({
  code: z.string().min(1),
});

export const createManualBlockValidator = z
  .object({
    date: isoDate.optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    reason: z.string().max(200).optional(),
  })
  .refine((d) => Boolean(d.date) !== Boolean(d.startAt && d.endAt), {
    message: "Provide either a whole-day date or a startAt+endAt range, not both",
  });
