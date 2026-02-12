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
} from "./queries";
import {
  createEvent,
  updateEvent,
  cancelEvent,
  registerEvent,
  cancelRegistration,
  removeParticipant,
  adminUpdateStatus,
  adminDeleteEvent,
} from "./mutations";
import {
  getEventValidator,
  listEventsValidator,
  listOrganizationEventsValidator,
  listMyEventsValidator,
  listParticipantsValidator,
  createEventValidator,
  updateEventValidator,
  deleteEventValidator,
  registerEventValidator,
  cancelRegistrationValidator,
  removeParticipantValidator,
  updateEventStatusValidator,
  adminListEventsValidator,
} from "./validators";

export const eventRouter = new Hono<HonoContext>();

eventRouter.use("/*", requireAuth);

// --- User routes ---
eventRouter.get("/get", zValidator("query", getEventValidator), getEvent);
eventRouter.get("/list", zValidator("query", listEventsValidator), listEvents);
eventRouter.get("/list-my-events", zValidator("query", listMyEventsValidator), listMyEvents);
eventRouter.get("/list-participants", zValidator("query", listParticipantsValidator), listParticipants);
eventRouter.post("/register", zValidator("json", registerEventValidator), registerEvent);
eventRouter.post("/cancel-registration", zValidator("json", cancelRegistrationValidator), cancelRegistration);

// --- Organizer routes (auth checked in handler via assertOrgAdmin) ---
eventRouter.post("/create", zValidator("json", createEventValidator), createEvent);
eventRouter.post("/update", zValidator("json", updateEventValidator), updateEvent);
eventRouter.post("/cancel", zValidator("json", deleteEventValidator), cancelEvent);
eventRouter.post("/remove-participant", zValidator("json", removeParticipantValidator), removeParticipant);
eventRouter.get("/list-organization-events", zValidator("query", listOrganizationEventsValidator), listOrganizationEvents);

// --- Admin routes ---
eventRouter.get("/admin-list-events", isAdmin, zValidator("query", adminListEventsValidator), adminListEvents);
eventRouter.post("/admin-update-status", isAdmin, zValidator("json", updateEventStatusValidator), adminUpdateStatus);
eventRouter.post("/admin-delete", isAdmin, zValidator("json", deleteEventValidator), adminDeleteEvent);
