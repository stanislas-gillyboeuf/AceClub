import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import {
  createOrganization,
  setActive,
  updateOrganization,
  deleteOrganization,
  addMember,
  removeMember,
  updateMemberRole,
  leaveOrganization,
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  requestClub,
  togglePin,
  regeneratePin,
} from "./mutations";
import {
  createOrganizationValidator,
  deleteOrganizationValidator,
  getFullOrganizationValidator,
  setActiveOrganizationValidator,
  updateOrganizationValidator,
  addMemberValidator,
  removeMemberValidator,
  updateMemberRoleValidator,
  listMembersValidator,
  leaveOrganizationValidator,
  createInvitationValidator,
  invitationIdValidator,
  listInvitationsValidator,
} from "./validators";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import {
  listOrganizationsUser,
  getFullOrganization,
  listMembers,
  getActiveMember,
  getActiveMemberRole,
  listInvitations,
  listUserInvitations,
  getInvitation,
  searchOrganizations,
  getOrganizationStats,
  getPin,
} from "./queries";
import {
  searchOrganizationsValidator,
  getOrganizationStatsValidator,
  requestClubValidator,
  togglePinValidator,
  regeneratePinValidator,
  getPinValidator,
} from "./validators";

export const organizationRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
organizationRouter.use("/*", requireAuth);

// Organization queries (accessible to authenticated users)
organizationRouter.get(
  "/search",
  zValidator("query", searchOrganizationsValidator),
  searchOrganizations,
);
organizationRouter.get("/list-organizations-user", listOrganizationsUser);
organizationRouter.get(
  "/get-full-organization",
  zValidator("query", getFullOrganizationValidator),
  getFullOrganization,
);
organizationRouter.get(
  "/get-organization-stats",
  zValidator("query", getOrganizationStatsValidator),
  getOrganizationStats,
);

// Organization mutations (accessible to organization members with permissions)
organizationRouter.post(
  "/update",
  zValidator("json", updateOrganizationValidator),
  updateOrganization,
);
organizationRouter.post(
  "/set-active",
  zValidator("json", setActiveOrganizationValidator),
  setActive,
);

// Member queries (accessible to organization members)
organizationRouter.get("/list-members", zValidator("query", listMembersValidator), listMembers);
organizationRouter.get("/get-active-member", getActiveMember);
organizationRouter.get("/get-active-member-role", getActiveMemberRole);

// Member mutations (require appropriate permissions)
organizationRouter.post("/add-member", zValidator("json", addMemberValidator), addMember);
organizationRouter.post("/remove-member", zValidator("json", removeMemberValidator), removeMember);
organizationRouter.post(
  "/update-member-role",
  zValidator("json", updateMemberRoleValidator),
  updateMemberRole,
);
organizationRouter.post(
  "/leave-organization",
  zValidator("json", leaveOrganizationValidator),
  leaveOrganization,
);

// Invitation queries
organizationRouter.get(
  "/list-invitations",
  zValidator("query", listInvitationsValidator),
  listInvitations,
);
organizationRouter.get("/list-user-invitations", listUserInvitations);
organizationRouter.get(
  "/get-invitation",
  zValidator("query", invitationIdValidator),
  getInvitation,
);

// Invitation mutations
organizationRouter.post(
  "/create-invitation",
  zValidator("json", createInvitationValidator),
  createInvitation,
);
organizationRouter.post(
  "/accept-invitation",
  zValidator("json", invitationIdValidator),
  acceptInvitation,
);
organizationRouter.post(
  "/reject-invitation",
  zValidator("json", invitationIdValidator),
  rejectInvitation,
);
organizationRouter.post(
  "/cancel-invitation",
  zValidator("json", invitationIdValidator),
  cancelInvitation,
);

organizationRouter.post("/request-club", zValidator("json", requestClubValidator), requestClub);

// PIN management (org admins/owners)
organizationRouter.get("/get-pin", zValidator("query", getPinValidator), getPin);
organizationRouter.post("/toggle-pin", zValidator("json", togglePinValidator), togglePin);
organizationRouter.post(
  "/regenerate-pin",
  zValidator("json", regeneratePinValidator),
  regeneratePin,
);

// Admin-only routes
organizationRouter.use("/*", isAdmin);
organizationRouter.post(
  "/create",
  zValidator("json", createOrganizationValidator),
  createOrganization,
);
organizationRouter.post(
  "/delete",
  zValidator("json", deleteOrganizationValidator),
  deleteOrganization,
);
