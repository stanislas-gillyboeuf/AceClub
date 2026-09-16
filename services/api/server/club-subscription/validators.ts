import { z } from "zod";

export const listTypesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const createTypeValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required"),
  priceCents: z.number().int().min(0).optional(),
  durationDays: z.number().int().min(1).optional(),
});

export const getMemberSubscriptionValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const assignSubscriptionValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  subscriptionTypeId: z.string().min(1, "Subscription type is required"),
  amountDueCents: z.number().int().min(0).optional().default(0),
});
