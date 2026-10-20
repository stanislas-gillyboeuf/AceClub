import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import {
  getAvailability,
  getSlots,
  getBookingByToken,
  getBookingIcs,
  getAdminSettings,
  listAdminBookings,
  listAdminBlocks,
  getGoogleStatus,
  getGoogleAuthUrl,
} from "./queries";
import {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  noSlotContact,
  updateAdminSettings,
  createAdminBlock,
  deleteAdminBlock,
  exchangeGoogleCode,
  disconnectGoogle,
} from "./mutations";
import {
  availabilityQueryValidator,
  slotsQueryValidator,
  createDemoBookingValidator,
  rescheduleDemoBookingValidator,
  noSlotContactValidator,
  updateDemoBookingSettingsValidator,
  listDemoBookingsValidator,
  createManualBlockValidator,
  exchangeGoogleCodeValidator,
} from "./validators";

export const demoBookingRouter = new Hono<HonoContext>();

// requireAuth MUST come before isAdmin to inject user into context
demoBookingRouter.use("/admin/*", requireAuth);
demoBookingRouter.use("/admin/*", isAdmin);

// --- Public (prospect-facing) ---
demoBookingRouter.get("/availability", zValidator("query", availabilityQueryValidator), getAvailability);
demoBookingRouter.get("/slots", zValidator("query", slotsQueryValidator), getSlots);
demoBookingRouter.post("/", zValidator("json", createDemoBookingValidator), createBooking);
demoBookingRouter.post("/no-slot-contact", zValidator("json", noSlotContactValidator), noSlotContact);
demoBookingRouter.get("/:cancelToken", getBookingByToken);
demoBookingRouter.get("/:cancelToken/ics", getBookingIcs);
demoBookingRouter.post("/:cancelToken/cancel", cancelBooking);
demoBookingRouter.post(
  "/:cancelToken/reschedule",
  zValidator("json", rescheduleDemoBookingValidator),
  rescheduleBooking,
);

// --- Admin (platform admin only — single calendar owner) ---
demoBookingRouter.get("/admin/settings", getAdminSettings);
demoBookingRouter.put(
  "/admin/settings",
  zValidator("json", updateDemoBookingSettingsValidator),
  updateAdminSettings,
);
demoBookingRouter.get("/admin/bookings", zValidator("query", listDemoBookingsValidator), listAdminBookings);
demoBookingRouter.get("/admin/blocks", listAdminBlocks);
demoBookingRouter.post("/admin/blocks", zValidator("json", createManualBlockValidator), createAdminBlock);
demoBookingRouter.delete("/admin/blocks/:id", deleteAdminBlock);
demoBookingRouter.get("/admin/google/status", getGoogleStatus);
demoBookingRouter.get("/admin/google/auth-url", getGoogleAuthUrl);
demoBookingRouter.post(
  "/admin/google/exchange-code",
  zValidator("json", exchangeGoogleCodeValidator),
  exchangeGoogleCode,
);
demoBookingRouter.post("/admin/google/disconnect", disconnectGoogle);
