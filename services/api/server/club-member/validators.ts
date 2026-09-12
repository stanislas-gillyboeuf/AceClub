import { z } from "zod";

export const listClubMembersValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const getClubMemberDetailValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const updateClubMemberProfileValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  licenseNumber: z.string().max(50).nullable().optional(),
  licenseValidUntil: z.string().datetime().nullable().optional(),
  phoneOverride: z.string().max(30).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateRestrictedAccessValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  restrictedDashboardAccess: z.boolean(),
});

const bulkImportRowValidator = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(30).optional(),
  licenseNumber: z.string().max(50).optional(),
  licenseValidUntil: z.string().datetime().optional(),
  dateOfBirth: z.string().optional(),
});

export const bulkImportValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  rows: z.array(bulkImportRowValidator).min(1).max(500),
});
