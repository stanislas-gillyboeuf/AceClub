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
  medicalCertificateValidUntil: z.string().datetime().nullable().optional(),
  phoneOverride: z.string().max(30).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  isVip: z.boolean().optional(),
  // Pricing-engine inputs — nullable().optional() so the handler can tell "not sent" (leave
  // as-is) apart from "explicitly cleared" (set to null), see mutations/update-club-member-profile.ts.
  licensedElsewhere: z.boolean().nullable().optional(),
  householdRank: z.number().int().min(1).max(10).nullable().optional(),
  communeInsee: z.string().min(1).nullable().optional(),
  communeName: z.string().min(1).nullable().optional(),
});

export const addMemberValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(30).optional(),
  role: z.enum(["member", "admin", "coach"]).optional().default("member"),
  // Generates a login password for this person and returns it once in the response — for
  // creating an admin/coach who needs to sign in directly, rather than a ghost profile that
  // only becomes usable once its owner signs up themselves.
  generatePassword: z.boolean().optional().default(false),
});

export const removeMemberValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const addMemberNoteValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  body: z.string().min(1, "Note body is required").max(2000),
});

export const listMemberNotesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const listUpcomingBookingsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const updateMemberRoleValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["admin", "member", "coach"]),
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
