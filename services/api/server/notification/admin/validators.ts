import { z } from "zod";
import { NOTIFICATION_TYPES } from "../../../db/schema/notification/schema";

export const notificationTypeValidator = z.enum(NOTIFICATION_TYPES);

export const templateTypeParamValidator = z.object({
  type: notificationTypeValidator,
});

export const upsertTemplateValidator = z.object({
  type: notificationTypeValidator,
  description: z.string().min(1, "Description requise"),
  availableVariables: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().default(true),
});

export const createVariantValidator = z.object({
  templateId: z.string().min(1),
  title: z.string().min(1, "Titre requis"),
  body: z.string().min(1, "Contenu requis"),
  isActive: z.boolean().default(true),
});

export const updateVariantValidator = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const sendTestValidator = z.object({
  variantId: z.string().min(1),
  variables: z.record(z.string(), z.string()).default({}),
});

// Shape check only — trigger.dev validates the full semantics when the
// schedule is registered, and surfaces a clear error to the admin handler.
const CRON_SHAPE = /^[\d*/,\-?LW#]+(?:\s+[\d*/,\-?LW#]+){4,5}$/;
const cronExpression = z
  .string()
  .min(1, "Expression cron requise")
  .regex(CRON_SHAPE, "Expression cron invalide");

const audienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({ type: z.literal("user_ids"), userIds: z.array(z.string().min(1)).min(1) }),
]);

export const createScheduleValidator = z.object({
  templateId: z.string().min(1),
  name: z.string().min(1),
  cronExpression,
  timezone: z.string().default("UTC"),
  audience: audienceSchema,
  defaultVariables: z.record(z.string(), z.string()).default({}),
  isActive: z.boolean().default(true),
});

export const updateScheduleValidator = z.object({
  name: z.string().min(1).optional(),
  cronExpression: cronExpression.optional(),
  timezone: z.string().optional(),
  audience: audienceSchema.optional(),
  defaultVariables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
});
