import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import {
  listUsers,
  listUserSessions,
  userStats,
  listOrganizations,
  getOrganization,
  listOrganizationMembers,
  listOrganizationInvitations,
  listFeatureFlags,
} from "./queries";
import { zValidator } from "@hono/zod-validator";
import {
  banUserValidator,
  createUserValidator,
  listUserSessionsValidator,
  listUsersValidator,
  listOrganizationsValidator,
  listOrganizationMembersValidator,
  listOrganizationInvitationsValidator,
  updateOrganizationAdminValidator,
  deleteOrganizationAdminValidator,
  createOrganizationInvitationAdminValidator,
  cancelOrganizationInvitationAdminValidator,
  setRoleValidator,
  updateUserValidator,
  setUserPasswordValidator,
  unbanUserValidator,
  revokeUserSessionsValidator,
  revokeUserSessionValidator,
  createFeatureFlagValidator,
  updateFeatureFlagValidator,
  setFeatureFlagOverrideValidator,
  updateMatchAdminValidator,
  processDeletionRequestValidator,
  bulkCreateOrganizationsValidator,
  updateMemberRoleAdminValidator,
} from "./validators";
import {
  banUser,
  createUser,
  revokeUserSession,
  revokeUserSessions,
  setRole,
  setUserPassword,
  unbanUser,
  updateUser,
  updateOrganization,
  deleteOrganization,
  createOrganizationInvitation,
  cancelOrganizationInvitation,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  setFeatureFlagOverride,
  removeFeatureFlagOverride,
  updateMatchAdmin,
  processDeletionRequest,
  bulkCreateOrganizations,
  updateMemberRole,
} from "./mutations";

export const adminRouter = new Hono<HonoContext>();

// requireAuth MUST come before isAdmin to inject user into context
adminRouter.use("/*", requireAuth);
adminRouter.use("/*", isAdmin);

adminRouter.get("/list-users", zValidator("query", listUsersValidator), listUsers);

adminRouter.get(
  "/list-user-sessions",
  zValidator("query", listUserSessionsValidator),
  listUserSessions,
);

adminRouter.get("/user-stats/:userId", userStats);

adminRouter.get(
  "/list-organizations",
  zValidator("query", listOrganizationsValidator),
  listOrganizations,
);

adminRouter.get("/get-organization/:organizationId", getOrganization);

adminRouter.get(
  "/list-organization-members",
  zValidator("query", listOrganizationMembersValidator),
  listOrganizationMembers,
);

adminRouter.put("/update-user", zValidator("json", updateUserValidator), updateUser);

adminRouter.post("/set-role", zValidator("json", setRoleValidator), setRole);

adminRouter.put(
  "/set-user-password",
  zValidator("json", setUserPasswordValidator),
  setUserPassword,
);

adminRouter.post("/create-user", zValidator("json", createUserValidator), createUser);

adminRouter.post("/ban-user", zValidator("json", banUserValidator), banUser);

adminRouter.post("/unban-user", zValidator("json", unbanUserValidator), unbanUser);

adminRouter.post(
  "/revoke-user-session",
  zValidator("json", revokeUserSessionValidator),
  revokeUserSession,
);

adminRouter.post(
  "/revoke-user-sessions",
  zValidator("json", revokeUserSessionsValidator),
  revokeUserSessions,
);

adminRouter.get(
  "/list-organization-invitations",
  zValidator("query", listOrganizationInvitationsValidator),
  listOrganizationInvitations,
);

adminRouter.post(
  "/update-organization",
  zValidator("json", updateOrganizationAdminValidator),
  updateOrganization,
);

adminRouter.post(
  "/delete-organization",
  zValidator("json", deleteOrganizationAdminValidator),
  deleteOrganization,
);

adminRouter.post(
  "/create-organization-invitation",
  zValidator("json", createOrganizationInvitationAdminValidator),
  createOrganizationInvitation,
);

adminRouter.post(
  "/cancel-organization-invitation",
  zValidator("json", cancelOrganizationInvitationAdminValidator),
  cancelOrganizationInvitation,
);

// Feature flags
adminRouter.get("/feature-flags", listFeatureFlags);

adminRouter.post(
  "/feature-flags",
  zValidator("json", createFeatureFlagValidator),
  createFeatureFlag,
);

adminRouter.put(
  "/feature-flags/:id",
  zValidator("json", updateFeatureFlagValidator),
  updateFeatureFlag,
);

adminRouter.delete("/feature-flags/:id", deleteFeatureFlag);

adminRouter.post(
  "/feature-flags/:id/overrides",
  zValidator("json", setFeatureFlagOverrideValidator),
  setFeatureFlagOverride,
);

adminRouter.delete("/feature-flags/:id/overrides/:orgId", removeFeatureFlagOverride);

// Match admin
adminRouter.put("/update-match", zValidator("json", updateMatchAdminValidator), updateMatchAdmin);

// Account deletion requests
adminRouter.post(
  "/process-deletion-request",
  zValidator("json", processDeletionRequestValidator),
  processDeletionRequest,
);

// Member role
adminRouter.post(
  "/update-member-role",
  zValidator("json", updateMemberRoleAdminValidator),
  updateMemberRole,
);

// Bulk organization import
adminRouter.post(
  "/bulk-create-organizations",
  zValidator("json", bulkCreateOrganizationsValidator),
  bulkCreateOrganizations,
);
