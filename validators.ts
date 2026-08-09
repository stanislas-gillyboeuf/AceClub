import { z } from "zod";

const courtSurfaceEnum = z.enum(["clay", "hard", "grass", "carpet"]);
const courtLocationEnum = z.enum(["indoor", "outdoor"]);

// --- Queries ---

export const listCourtsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const getAvailabilityValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  date: z.string().min(1, "Date is required"), // "YYYY-MM-DD"
});

export const listMyBookingsValidator = z.object({
  timeFilter: z.enum(["upcoming", "past"]).optional().default("upcoming"),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

// --- Mutations ---

export const bookCourtValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  startTime: z.string().datetime("Invalid start time"),
  endTime: z.string().datetime("Invalid end time"),
});

export const cancelBookingValidator = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

// --- Admin / organizer ---

export const createCourtValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required"),
  surface: courtSurfaceEnum.optional().default("hard"),
  location: courtLocationEnum.optional().default("outdoor"),
  pricePerHour: z.number().int().min(0).optional(),
});

export const updateCourtValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  name: z.string().min(1).optional(),
  surface: courtSurfaceEnum.optional(),
  location: courtLocationEnum.optional(),
  pricePerHour: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});
