import { z } from "zod";

const organizationId = z.string().min(1, "Organization ID is required");

export const listHouseholdsValidator = z.object({ organizationId });

export const getHouseholdValidator = z.object({
  organizationId,
  householdId: z.string().min(1, "Household ID is required"),
});

export const createHouseholdValidator = z.object({
  organizationId,
  name: z.string().trim().min(1, "Name is required").max(100),
  payerUserId: z.string().min(1).nullable().optional(),
  contactEmail: z.string().trim().email("Valid email is required").nullable().optional(),
  memberUserIds: z.array(z.string().min(1)).max(50).optional(),
});

export const updateHouseholdValidator = z.object({
  organizationId,
  householdId: z.string().min(1, "Household ID is required"),
  name: z.string().trim().min(1).max(100).optional(),
  payerUserId: z.string().min(1).nullable().optional(),
  contactEmail: z.string().trim().email("Valid email is required").nullable().optional(),
});

export const deleteHouseholdValidator = z.object({
  organizationId,
  householdId: z.string().min(1, "Household ID is required"),
});

export const setMemberHouseholdValidator = z.object({
  organizationId,
  userId: z.string().min(1, "User ID is required"),
  householdId: z.string().min(1).nullable(),
});
