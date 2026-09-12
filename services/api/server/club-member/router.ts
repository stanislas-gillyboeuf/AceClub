import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listClubMembers, getClubMemberDetail } from "./queries";
import { updateClubMemberProfile, updateRestrictedAccess, bulkImport } from "./mutations";
import {
  listClubMembersValidator,
  getClubMemberDetailValidator,
  updateClubMemberProfileValidator,
  updateRestrictedAccessValidator,
  bulkImportValidator,
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

// --- Mutations (full admin only, enforced in each handler) ---
clubMemberRouter.post(
  "/update-profile",
  zValidator("json", updateClubMemberProfileValidator),
  updateClubMemberProfile,
);
clubMemberRouter.post(
  "/update-access",
  zValidator("json", updateRestrictedAccessValidator),
  updateRestrictedAccess,
);
clubMemberRouter.post("/bulk-import", zValidator("json", bulkImportValidator), bulkImport);
