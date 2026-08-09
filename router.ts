import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { listCourts, getAvailability, listMyBookings } from "./queries";
import { bookCourt, cancelBooking, createCourt, updateCourt } from "./mutations";
import {
  listCourtsValidator,
  getAvailabilityValidator,
  listMyBookingsValidator,
  bookCourtValidator,
  cancelBookingValidator,
  createCourtValidator,
  updateCourtValidator,
} from "./validators";

export const courtRouter = new Hono<HonoContext>();

courtRouter.use("/*", requireAuth);

// --- User routes ---
courtRouter.get("/list", zValidator("query", listCourtsValidator), listCourts);
courtRouter.get("/availability", zValidator("query", getAvailabilityValidator), getAvailability);
courtRouter.get(
  "/list-my-bookings",
  zValidator("query", listMyBookingsValidator),
  listMyBookings,
);
courtRouter.post("/book", zValidator("json", bookCourtValidator), bookCourt);
courtRouter.post("/cancel-booking", zValidator("json", cancelBookingValidator), cancelBooking);

// --- Club admin routes (auth checked in handler via assertOrgAdmin) ---
courtRouter.post("/create", zValidator("json", createCourtValidator), createCourt);
courtRouter.post("/update", zValidator("json", updateCourtValidator), updateCourt);
