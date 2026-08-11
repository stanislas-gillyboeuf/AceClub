import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { listCourts, listAvailability, listMyBookings } from "./queries";
import { createBooking, cancelBooking } from "./mutations";
import {
  listCourtsValidator,
  listAvailabilityValidator,
  createBookingValidator,
  cancelBookingValidator,
  listMyBookingsValidator,
} from "./validators";

export const courtRouter = new Hono<HonoContext>();

courtRouter.use("/*", requireAuth);

courtRouter.get("/list", zValidator("query", listCourtsValidator), listCourts);
courtRouter.get("/availability", zValidator("query", listAvailabilityValidator), listAvailability);
courtRouter.get("/my-bookings", zValidator("query", listMyBookingsValidator), listMyBookings);
courtRouter.post("/book", zValidator("json", createBookingValidator), createBooking);
courtRouter.post("/cancel-booking", zValidator("json", cancelBookingValidator), cancelBooking);
