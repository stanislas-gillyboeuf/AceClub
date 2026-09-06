import { z } from "zod";

const eventStatusEnum = z.enum([
  "draft",
  "presale",
  "on_sale",
  "completed",
  "full",
  "cancelled",
  "archived",
]);
const eventVisibilityEnum = z.enum(["public", "organization"]);

// --- Mutations ---

export const createEventValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxParticipants: z.number().int().min(1).optional(),
  isFree: z.boolean().optional().default(true),
  price: z.number().int().min(0).optional(),
  paymentLink: z.string().url().optional(),
  visibility: eventVisibilityEnum.optional().default("public"),
  organizationId: z.string().min(1, "Organization is required"),
});

export const updateEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  maxParticipants: z.number().int().min(1).nullable().optional(),
  isFree: z.boolean().optional(),
  price: z.number().int().min(0).nullable().optional(),
  paymentLink: z.string().url().nullable().optional(),
  visibility: eventVisibilityEnum.optional(),
});

export const updateEventStatusValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  status: eventStatusEnum,
});

export const deleteEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

// --- Queries ---

export const getEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const listEventsValidator = z.object({
  organizationId: z.string().optional(),
  status: z.string().optional(),
  visibility: eventVisibilityEnum.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(["upcoming", "nearest", "recent", "past"]).optional().default("upcoming"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export const listOrganizationEventsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const listMyEventsValidator = z.object({
  status: z.enum(["registered", "waitlisted", "cancelled"]).optional(),
  timeFilter: z.enum(["upcoming", "past"]).optional().default("upcoming"),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const listParticipantsValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  status: z.enum(["registered", "waitlisted", "cancelled"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// --- Registration ---

export const registerEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const cancelRegistrationValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const removeParticipantValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// --- Admin ---

export const adminListEventsValidator = z.object({
  status: z.string().optional(),
  organizationId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const adminListParticipantsValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  status: z.enum(["registered", "waitlisted", "cancelled"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const adminRemoveParticipantValidator = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
});

export const adminUpdateParticipantStatusValidator = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  status: z.enum(["registered", "waitlisted", "cancelled"]),
});
