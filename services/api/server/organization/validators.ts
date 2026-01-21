import { z } from "zod";

export const createOrganizationValidator = z.object({
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  userId: z.string().optional(),
  keepCurrentActiveOrganization: z.boolean().optional(),
});

export const setActiveOrganizationValidator = z.object({
  organizationId: z.string().optional(),
  organizationSlug: z.string(),
});

export const getFullOrganizationValidator = z.object({
  organizationId: z.string().optional(),
  organizationSlug: z.string(),
  membersLimit: z.number().default(100),
});

export const updateOrganizationValidator = z.object({
  data: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    logo: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  organizationId: z.string(),
});

export const deleteOrganizationValidator = z.object({
  organizationId: z.string(),
});

// Member validators
export const addMemberValidator = z.object({
  userId: z.string().nullable().optional(),
  role: z.union([z.string(), z.array(z.string())]),
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
});

export const removeMemberValidator = z.object({
  memberIdOrEmail: z.string(),
  organizationId: z.string().optional(),
});

export const updateMemberRoleValidator = z.object({
  role: z.union([z.string(), z.array(z.string())]),
  memberId: z.string(),
  organizationId: z.string().optional(),
});

export const listMembersValidator = z.object({
  organizationId: z.string().optional(),
  limit: z.number().default(100).optional(),
  offset: z.number().default(0).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterOperator: z
    .enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains"])
    .optional(),
  filterValue: z.string().optional(),
});

export const leaveOrganizationValidator = z.object({
  organizationId: z.string(),
});

// Invitation validators
export const createInvitationValidator = z.object({
  email: z.string().email(),
  role: z.string().default("member"),
  organizationId: z.string().optional(),
  resend: z.boolean().optional(),
});

export const invitationIdValidator = z.object({
  invitationId: z.string(),
});

export const listInvitationsValidator = z.object({
  organizationId: z.string().optional(),
});
