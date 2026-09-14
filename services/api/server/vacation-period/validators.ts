import { z } from "zod";

const dateStringValidator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const listVacationPeriodsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const createVacationPeriodValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Name is required").max(100),
    startDate: dateStringValidator,
    endDate: dateStringValidator,
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const deleteVacationPeriodValidator = z.object({
  vacationPeriodId: z.string().min(1, "Vacation period ID is required"),
});
