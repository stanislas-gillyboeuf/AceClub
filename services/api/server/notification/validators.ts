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
