import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { listCourts, listAvailability, listMyBookings, getBookingEnabled } from "./queries";
import { createBooking, cancelBooking, createCourt, updateCourt } from "./mutations";
import {
  listCourtsValidator,
  listAvailabilityValidator,
  createBookingValidator,
  cancelBookingValidator,
  listMyBookingsValidator,
  createCourtValidator,
  updateCourtValidator,
  bookingEnabledValidator,
} from "./validators";

export const courtRouter = new Hono<HonoContext>();

courtRouter.use("/*", requireAuth);

// --- Queries ---
courtRouter.get("/list", zValidator("query", listCourtsValidator), listCourts);
courtRouter.get("/availability", zValidator("query", listAvailabilityValidator), listAvailability);
courtRouter.get("/my-bookings", zValidator("query", listMyBookingsValidator), listMyBookings);
courtRouter.get(
  "/booking-enabled",
  zValidator("query", bookingEnabledValidator),
  getBookingEnabled,
);

// --- Bookings ---
courtRouter.post("/book", zValidator("json", createBookingValidator), createBooking);
courtRouter.post("/cancel-booking", zValidator("json", cancelBookingValidator), cancelBooking);

// --- Court management (club admins) ---
courtRouter.post("/create", zValidator("json", createCourtValidator), createCourt);
courtRouter.post("/update", zValidator("json", updateCourtValidator), updateCourt);
