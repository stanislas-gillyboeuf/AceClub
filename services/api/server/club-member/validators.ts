import { z } from "zod";
import { isValidIsoDate } from "../pricing/lib/engine";
import { isTechnicalEmail } from "../../lib/technical-email";

// Stored as text and read by the pricing engine, which expects a real "YYYY-MM-DD" date.
const isoDateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
  .refine(isValidIsoDate, "Date of birth must be a real calendar date");

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
  dateOfBirth: isoDateOfBirthSchema.nullable().optional(),
  isAdherent: z.boolean().nullable().optional(),
  isNewMember: z.boolean().nullable().optional(),
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

const bulkImportRowValidator = z
  .object({
    name: z.string().min(1, "Name is required"),
    // Optional: a child often has no email. Without one, the date of birth is what identifies
    // the person (see lib/plan-import.ts).
    email: z.string().email("Valid email is required").optional(),
    phone: z.string().max(30).optional(),
    licenseNumber: z.string().max(50).optional(),
    licenseValidUntil: z.string().datetime().optional(),
    medicalCertificateValidUntil: z.string().datetime().optional(),
    dateOfBirth: isoDateOfBirthSchema.optional(),
    postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits").optional(),
    city: z.string().max(100).optional(),
    licensedElsewhere: z.boolean().optional(),
    // The responsible person's email (lowercase) or a normalized "household" label: rows that
    // share it form one household.
    householdKey: z.string().max(200).optional(),
    tags: z.array(z.string().min(1).max(60)).max(20).optional(),
  })
  .superRefine((row, ctx) => {
    if (!row.email && !row.dateOfBirth) {
      ctx.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "Email or date of birth is required to identify the person",
      });
    }
    if (row.email && isTechnicalEmail(row.email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "This address is reserved" });
    }
  });

export const bulkImportValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  rows: z.array(bulkImportRowValidator).min(1).max(2000),
  // Whether the imported people are new members (pay the entry fee) or an existing base. Only
  // applied to members CREATED by this import, never to ones already in the club.
  isNewMember: z.boolean().optional(),
});
