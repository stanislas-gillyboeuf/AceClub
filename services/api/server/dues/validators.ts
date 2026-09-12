import { z } from "zod";

export const listDuesTypesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const listAssignmentsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  duesTypeId: z.string().min(1).optional(),
  status: z.enum(["pending", "paid", "waived"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const getMemberDuesHistoryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const createDuesTypeValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required"),
  amountCents: z.number().int().min(0),
  dueDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDuesTypeValidator = z.object({
  duesTypeId: z.string().min(1, "Dues type ID is required"),
  name: z.string().min(1).optional(),
  amountCents: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const assignDuesValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    duesTypeId: z.string().min(1, "Dues type ID is required"),
    userIds: z.array(z.string().min(1)).max(1000).optional(),
    allActiveMembers: z.boolean().optional().default(false),
  })
  .refine((data) => data.allActiveMembers || (data.userIds && data.userIds.length > 0), {
    message: "Provide userIds or set allActiveMembers to true",
  });

export const markPaidValidator = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  paidMethod: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
});

export const waiveValidator = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  notes: z.string().max(2000).optional(),
});

export const sendReminderValidator = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
});
