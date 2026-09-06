import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import { zValidator } from "@hono/zod-validator";
import {
  getEvent,
  listEvents,
  listOrganizationEvents,
  listMyEvents,
  listParticipants,
  adminListEvents,
  adminListParticipants,
} from "./queries";
import {
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  cancelEvent,
  registerEvent,
  cancelRegistration,
  removeParticipant,
  adminUpdateStatus,
  adminDeleteEvent,
  adminRemoveParticipant,
  adminUpdateParticipantStatus,
} from "./mutations";
import {
  getEventValidator,
  listEventsValidator,
  listOrganizationEventsValidator,
  listMyEventsValidator,
  listParticipantsValidator,
  createEventValidator,
  updateEventValidator,
  updateEventStatusValidator,
  deleteEventValidator,
  registerEventValidator,
  cancelRegistrationValidator,
  removeParticipantValidator,
  adminListEventsValidator,
  adminListParticipantsValidator,
  adminRemoveParticipantValidator,
  adminUpdateParticipantStatusValidator,
} from "./validators";

export const eventRouter = new Hono<HonoContext>();

eventRouter.use("/*", requireAuth);

// --- User routes ---
eventRouter.get("/get", zValidator("query", getEventValidator), getEvent);
eventRouter.get("/list", zValidator("query", listEventsValidator), listEvents);
eventRouter.get("/list-my-events", zValidator("query", listMyEventsValidator), listMyEvents);
eventRouter.get(
  "/list-participants",
  zValidator("query", listParticipantsValidator),
  listParticipants,
);
eventRouter.post("/register", zValidator("json", registerEventValidator), registerEvent);
eventRouter.post(
  "/cancel-registration",
  zValidator("json", cancelRegistrationValidator),
  cancelRegistration,
);

// --- Organizer routes (auth checked in handler via assertOrgAdmin) ---
eventRouter.post("/create", zValidator("json", createEventValidator), createEvent);
eventRouter.post("/update", zValidator("json", updateEventValidator), updateEvent);
eventRouter.post(
  "/update-status",
  zValidator("json", updateEventStatusValidator),
  updateEventStatus,
);
eventRouter.post("/delete", zValidator("json", deleteEventValidator), deleteEvent);
eventRouter.post("/cancel", zValidator("json", deleteEventValidator), cancelEvent);
eventRouter.post(
  "/remove-participant",
  zValidator("json", removeParticipantValidator),
  removeParticipant,
);
eventRouter.get(
  "/list-organization-events",
  zValidator("query", listOrganizationEventsValidator),
  listOrganizationEvents,
);

// --- Admin routes ---
eventRouter.get(
  "/admin-list-events",
  isAdmin,
  zValidator("query", adminListEventsValidator),
  adminListEvents,
);
eventRouter.post(
  "/admin-update-status",
  isAdmin,
  zValidator("json", updateEventStatusValidator),
  adminUpdateStatus,
);
eventRouter.post(
  "/admin-delete",
  isAdmin,
  zValidator("json", deleteEventValidator),
  adminDeleteEvent,
);
eventRouter.get(
  "/admin-list-participants",
  isAdmin,
  zValidator("query", adminListParticipantsValidator),
  adminListParticipants,
);
eventRouter.post(
  "/admin-remove-participant",
  isAdmin,
  zValidator("json", adminRemoveParticipantValidator),
  adminRemoveParticipant,
);
eventRouter.post(
  "/admin-update-participant-status",
  isAdmin,
  zValidator("json", adminUpdateParticipantStatusValidator),
  adminUpdateParticipantStatus,
);
