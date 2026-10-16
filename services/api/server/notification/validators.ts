import { z } from "zod";

export const registerDeviceTokenValidator = z.object({
  token: z.string().min(1, "Device token is required"),
  platform: z.enum(["ios", "android"]).default("ios"),
});

export const unregisterDeviceTokenValidator = z.object({
  token: z.string().min(1, "Device token is required"),
});

export const listNotificationsValidator = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export const markNotificationReadValidator = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

export const clubNotificationSettingsQueryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const upsertClubNotificationSettingsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  streakWarning: z.boolean(),
  challengeAssigned: z.boolean(),
  matchRequestUpdate: z.boolean(),
  matchLiked: z.boolean(),
  newMessage: z.boolean(),
  bookingReminder: z.boolean(),
  classReminder: z.boolean(),
  coachMessage: z.boolean(),
  cotisationRequestEmail: z.boolean(),
  cotisationReminderEmail: z.boolean(),
  invitationAccepted: z.boolean(),
  clubAnnouncement: z.boolean(),
  memberAlertDigestEmail: z.boolean(),
});
