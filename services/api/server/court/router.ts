import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import {
  listCourts,
  listAllForOrg,
  listAvailability,
  listMyBookings,
  getBookingEnabled,
  getSettings,
  getWeeklyQuota,
  getBoard,
  getBooking,
  getFrequentPartners,
  searchMembers,
  getAdminBoard,
} from "./queries";
import {
  createBooking,
  cancelBooking,
  createCourt,
  updateCourt,
  upsertSettings,
  bookForClub,
  joinBooking,
} from "./mutations";
import {
  listCourtsValidator,
  listAllForOrgValidator,
  listAvailabilityValidator,
  createBookingValidator,
  cancelBookingValidator,
  listMyBookingsValidator,
  createCourtValidator,
  updateCourtValidator,
  bookingEnabledValidator,
  courtSettingsQueryValidator,
  upsertSettingsValidator,
  weeklyQuotaValidator,
  bookForClubValidator,
  boardQueryValidator,
  adminBoardQueryValidator,
  searchMembersValidator,
  joinBookingValidator,
} from "./validators";

export const courtRouter = new Hono<HonoContext>();

courtRouter.use("/*", requireAuth);

// --- Queries ---
courtRouter.get("/list", zValidator("query", listCourtsValidator), listCourts);
courtRouter.get(
  "/list-all-for-org",
  zValidator("query", listAllForOrgValidator),
  listAllForOrg,
);
courtRouter.get("/availability", zValidator("query", listAvailabilityValidator), listAvailability);
courtRouter.get("/my-bookings", zValidator("query", listMyBookingsValidator), listMyBookings);
courtRouter.get(
  "/booking-enabled",
  zValidator("query", bookingEnabledValidator),
  getBookingEnabled,
);
courtRouter.get("/settings", zValidator("query", courtSettingsQueryValidator), getSettings);
courtRouter.get("/my-weekly-quota", zValidator("query", weeklyQuotaValidator), getWeeklyQuota);
courtRouter.get("/board", zValidator("query", boardQueryValidator), getBoard);
courtRouter.get("/admin-board", zValidator("query", adminBoardQueryValidator), getAdminBoard);
courtRouter.get("/booking/:bookingId", getBooking);
courtRouter.get("/frequent-partners", getFrequentPartners);
courtRouter.get("/search-members", zValidator("query", searchMembersValidator), searchMembers);

// --- Bookings ---
courtRouter.post("/book", zValidator("json", createBookingValidator), createBooking);
courtRouter.post("/book-for-club", zValidator("json", bookForClubValidator), bookForClub);
courtRouter.post("/cancel-booking", zValidator("json", cancelBookingValidator), cancelBooking);
courtRouter.post("/join-booking", zValidator("json", joinBookingValidator), joinBooking);

// --- Court management (club admins) ---
courtRouter.post("/create", zValidator("json", createCourtValidator), createCourt);
courtRouter.post("/update", zValidator("json", updateCourtValidator), updateCourt);
courtRouter.post(
  "/settings/update",
  zValidator("json", upsertSettingsValidator),
  upsertSettings,
);
