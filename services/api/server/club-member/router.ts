import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listClubMembers, getClubMemberDetail, listMemberNotes, listUpcomingBookings } from "./queries";
import {
  updateClubMemberProfile,
  updateMemberRole,
  bulkImport,
  addMember,
  removeMember,
  addMemberNote,
} from "./mutations";
import {
  listClubMembersValidator,
  getClubMemberDetailValidator,
  updateClubMemberProfileValidator,
  updateMemberRoleValidator,
  bulkImportValidator,
  addMemberValidator,
  removeMemberValidator,
  addMemberNoteValidator,
  listMemberNotesValidator,
  listUpcomingBookingsValidator,
} from "./validators";

export const clubMemberRouter = new Hono<HonoContext>();

clubMemberRouter.use("/*", requireAuth);

// --- Queries ---
clubMemberRouter.get("/list", zValidator("query", listClubMembersValidator), listClubMembers);
clubMemberRouter.get(
  "/detail",
  zValidator("query", getClubMemberDetailValidator),
  getClubMemberDetail,
);
clubMemberRouter.get(
  "/list-notes",
  zValidator("query", listMemberNotesValidator),
  listMemberNotes,
);
clubMemberRouter.get(
  "/upcoming-bookings",
  zValidator("query", listUpcomingBookingsValidator),
  listUpcomingBookings,
);

// --- Mutations (full admin only, enforced in each handler) ---
clubMemberRouter.post(
  "/update-profile",
  zValidator("json", updateClubMemberProfileValidator),
  updateClubMemberProfile,
);
clubMemberRouter.post(
  "/update-role",
  zValidator("json", updateMemberRoleValidator),
  updateMemberRole,
);
clubMemberRouter.post("/bulk-import", zValidator("json", bulkImportValidator), bulkImport);
clubMemberRouter.post("/add", zValidator("json", addMemberValidator), addMember);
clubMemberRouter.post("/remove", zValidator("json", removeMemberValidator), removeMember);
clubMemberRouter.post("/add-note", zValidator("json", addMemberNoteValidator), addMemberNote);
