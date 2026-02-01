import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { listNotifications, getUnreadCount } from "./queries";
import { registerToken, unregisterToken, markRead, markAllRead } from "./mutations";
import {
  registerDeviceTokenValidator,
  unregisterDeviceTokenValidator,
  listNotificationsValidator,
  markNotificationReadValidator,
} from "./validators";

export const notificationRouter = new Hono<HonoContext>();

notificationRouter.use("/*", requireAuth);

// Queries
notificationRouter.get(
  "/",
  zValidator("query", listNotificationsValidator),
  listNotifications,
);
notificationRouter.get("/unread-count", getUnreadCount);

// Mutations
notificationRouter.post(
  "/register-token",
  zValidator("json", registerDeviceTokenValidator),
  registerToken,
);
notificationRouter.post(
  "/unregister-token",
  zValidator("json", unregisterDeviceTokenValidator),
  unregisterToken,
);
notificationRouter.post(
  "/mark-read",
  zValidator("json", markNotificationReadValidator),
  markRead,
);
notificationRouter.post("/mark-all-read", markAllRead);
