import { z } from "zod";

export const listCourtsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const listAvailabilityValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const createBookingValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):00$/, "Start time must be on the hour (HH:00)"),
});

export const cancelBookingValidator = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export const listMyBookingsValidator = z.object({
  filter: z.enum(["upcoming", "past"]).default("upcoming"),
});
