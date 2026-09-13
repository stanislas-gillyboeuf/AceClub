import { z } from "zod";

export const getDashboardSummaryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const remindMemberValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  message: z.string().min(1).max(300),
});
