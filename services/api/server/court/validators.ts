import { z } from "zod";
import { PADEL_TEAM_SIZE } from "./lib/padel";

const courtSurfaceEnum = z.enum(["clay", "hard", "grass", "carpet"]);
const courtAccessPolicyEnum = z.enum(["members_only", "open"]);
const courtCancellationPolicyEnum = z.enum(["anytime", "window", "disabled"]);
export const sportEnum = z.enum(["tennis", "padel"]);
const SLOT_DURATIONS = [30, 45, 60, 90, 120] as const;
const slotDurationEnum = z
  .number()
  .refine((v) => (SLOT_DURATIONS as readonly number[]).includes(v), {
    message: "Slot duration must be one of 30, 45, 60, 90, 120 minutes",
  });

const cancellationFields = {
  cancellationPolicy: courtCancellationPolicyEnum.optional(),
  cancellationWindowHours: z.number().int().min(1).optional(),
};

export const createCourtValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Name is required"),
    sport: sportEnum.optional().default("tennis"),
    surface: courtSurfaceEnum.optional(),
    indoor: z.boolean().optional().default(false),
    accessPolicy: courtAccessPolicyEnum.optional().default("members_only"),
    pricePerHour: z.number().int().min(0).optional(),
    slotDurationMinutes: slotDurationEnum.optional().default(60),
    ...cancellationFields,
  })
  .refine((data) => data.cancellationPolicy !== "window" || data.cancellationWindowHours != null, {
    message: "cancellationWindowHours is required when cancellationPolicy is 'window'",
    path: ["cancellationWindowHours"],
  });

export const updateCourtValidator = z
  .object({
    courtId: z.string().min(1, "Court ID is required"),
    name: z.string().min(1).optional(),
    sport: sportEnum.optional(),
    surface: courtSurfaceEnum.optional(),
    indoor: z.boolean().optional(),
    isActive: z.boolean().optional(),
    accessPolicy: courtAccessPolicyEnum.optional(),
    pricePerHour: z.number().int().min(0).nullable().optional(),
    slotDurationMinutes: slotDurationEnum.optional(),
    ...cancellationFields,
  })
  .refine((data) => data.cancellationPolicy !== "window" || data.cancellationWindowHours != null, {
    message: "cancellationWindowHours is required when cancellationPolicy is 'window'",
    path: ["cancellationWindowHours"],
  });

export const bookingEnabledValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const listCourtsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const boardQueryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  sport: sportEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const searchMembersValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  query: z.string().min(1).max(80),
});

export const joinBookingValidator = z
  .object({
    bookingId: z.string().min(1, "Booking ID is required"),
    userId: z.string().min(1).optional(),
    guestName: z.string().min(1).max(80).optional(),
  })
  .refine((data) => Boolean(data.userId) !== Boolean(data.guestName), {
    message: "Provide exactly one of userId or guestName",
  });

export const listAllForOrgValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const listAvailabilityValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const participantValidator = z
  .object({
    userId: z.string().min(1).optional(),
    guestName: z.string().min(1).max(80).optional(),
  })
  .refine((data) => Boolean(data.userId) !== Boolean(data.guestName), {
    message: "Provide exactly one of userId or guestName",
  });

export const createBookingValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:mm format"),
  participants: z.array(participantValidator).max(PADEL_TEAM_SIZE).optional().default([]),
});

export const bookForClubValidator = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  startAt: z.string().datetime("Invalid start date"),
  endAt: z.string().datetime("Invalid end date"),
  purpose: z.string().min(1).max(200).optional(),
  userId: z.string().min(1).optional(),
});

export const cancelBookingValidator = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  override: z.boolean().optional(),
});

export const adminBoardQueryValidator = boardQueryValidator;

export const listMyBookingsValidator = z.object({
  filter: z.enum(["upcoming", "past", "all"]).default("upcoming"),
});

export const courtSettingsQueryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const upsertSettingsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  openingHour: z.number().int().min(0).max(23),
  closingHour: z.number().int().min(1).max(24),
  maxBookingsPerWeekWeekday: z.number().int().min(1).nullable().optional(),
  maxBookingsPerWeekWeekend: z.number().int().min(1).nullable().optional(),
  bookingWindowDays: z.number().int().min(1).nullable().optional(),
});

export const weeklyQuotaValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});
