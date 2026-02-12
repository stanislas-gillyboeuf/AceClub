import { z } from "zod";

export const createEventValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  address: z.string().optional(),
  maxParticipants: z.number().int().min(1).optional(),
  visibility: z.enum(["public", "private"]).optional().default("public"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const updateEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  address: z.string().optional(),
  maxParticipants: z.number().int().min(1).nullable().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  status: z.enum(["open", "closed", "completed", "cancelled", "archived", "pending"]).optional(),
});

export const getEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const listEventsValidator = z.object({
  organizationId: z.string().optional(),
  status: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const listOrganizationEventsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

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

export const updateEventStatusValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  status: z.enum(["open", "closed", "completed", "cancelled", "archived", "pending"]),
});

export const listParticipantsValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  status: z.enum(["registered", "waitlisted", "cancelled"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const deleteEventValidator = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const listMyEventsValidator = z.object({
  status: z.enum(["registered", "waitlisted", "cancelled"]).optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const adminListEventsValidator = z.object({
  status: z.string().optional(),
  organizationId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});
