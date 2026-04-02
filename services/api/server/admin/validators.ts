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

export const processDeletionRequestValidator = z.object({
  requestId: z.string().min(1),
  status: z.enum(["processed", "rejected"]),
});

export const updateMemberRoleAdminValidator = z.object({
  memberId: z.string(),
  organizationId: z.string(),
  role: z.enum(["member", "admin", "owner"]),
});

// Game config
export const updateGameConfigValidator = z.object({
  value: z.string().min(1),
});

// Challenge templates
export const listChallengeTemplatesValidator = z.object({
  type: z.enum(["quantitative", "social", "performance"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  isActive: z.coerce.boolean().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const createChallengeTemplateValidator = z.object({
  code: z.string().min(1),
  type: z.enum(["quantitative", "social", "performance"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
  targetValue: z.number().int().min(1),
  acesReward: z.number().int().min(0),
  minLevel: z.number().int().min(1).default(1),
  maxLevel: z.number().int().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const updateChallengeTemplateValidator = z.object({
  type: z.enum(["quantitative", "social", "performance"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  titleFr: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  descriptionFr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  targetValue: z.number().int().min(1).optional(),
  acesReward: z.number().int().min(0).optional(),
  minLevel: z.number().int().min(1).optional(),
  maxLevel: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
});

// Badges
export const createBadgeValidator = z.object({
  code: z.string().min(1),
  category: z.enum(["level", "achievement", "milestone", "special"]),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
  imageUrl: z.string().min(1),
  requiredLevel: z.number().int().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateBadgeValidator = z.object({
  category: z.enum(["level", "achievement", "milestone", "special"]).optional(),
  nameFr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  descriptionFr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  requiredLevel: z.number().int().nullable().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const bulkCreateOrganizationsValidator = z.object({
  clubs: z
    .array(
      z.object({
        nom: z.string().min(1),
        clubId: z.string().min(1),
        ville: z.string().optional(),
        distance: z.string().optional(),
        terrainPratiqueLibelle: z.string().optional(),
        pratiques: z.array(z.string()).optional(),
        lat: z.number(),
        lng: z.number(),
      }),
    )
    .min(1)
    .max(10000),
});
