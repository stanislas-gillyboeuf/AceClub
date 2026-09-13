import { z } from "zod";

export const getDashboardSummaryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});
