import { z } from "zod";

export const listUsersValidator = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterValue: z.string().optional(),
  filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
});

export const updateUserValidator = z.object({
  userId: z.string(),
  data: z.record(z.string(), z.any()),
});

export const banUserValidator = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(),
});

export const unbanUserValidator = z.object({
  userId: z.string(),
});

export const listUserSessionsValidator = z.object({
  userId: z.string(),
});

export const revokeUserSessionValidator = z.object({
  sessionToken: z.string(),
});

export const revokeUserSessionsValidator = z.object({
  userId: z.string(),
});

export const createUserValidator = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.string().or(z.array(z.string())).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const setRoleValidator = z.object({
  userId: z.string(),
  role: z.string().or(z.array(z.string())),
});

export const setUserPasswordValidator = z.object({
  newPassword: z.string().min(8),
  userId: z.string(),
});

export const listOrganizationsValidator = z.object({
  searchValue: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const listOrganizationMembersValidator = z.object({
  organizationId: z.string(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const updateOrganizationAdminValidator = z.object({
  organizationId: z.string(),
  data: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    logo: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    address: z.string().optional(),
  }),
});

export const deleteOrganizationAdminValidator = z.object({
  organizationId: z.string(),
});

export const listOrganizationInvitationsValidator = z.object({
  organizationId: z.string(),
});

export const createOrganizationInvitationAdminValidator = z.object({
  organizationId: z.string(),
  email: z.string().email(),
  role: z.string().default("member"),
});

export const cancelOrganizationInvitationAdminValidator = z.object({
  invitationId: z.string(),
});

export const createFeatureFlagValidator = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]*$/, "Key must be snake_case"),
  enabled: z.boolean().default(false),
  description: z.string().optional(),
});

export const updateFeatureFlagValidator = z.object({
  enabled: z.boolean().optional(),
  description: z.string().optional(),
});

export const setFeatureFlagOverrideValidator = z.object({
  organizationId: z.string(),
  enabled: z.boolean(),
});

export const updateMatchAdminValidator = z.object({
  matchId: z.string().min(1),
  scheduledAt: z.string().datetime().nullable(),
});
