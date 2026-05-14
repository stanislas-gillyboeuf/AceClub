import { z } from "zod";
// @ts-ignore — cron-parser is added as a runtime dep; types ship with the package
import { parseExpression } from "cron-parser";

const NOTIFICATION_TYPES = [
  "match_request_accepted",
  "invitation_accepted",
  "new_match_request",
  "match_reminder",
  "challenge_assigned",
  "streak_warning",
  "new_message",
  "match_liked",
] as const;

export const upsertTemplateValidator = z.object({
  type: z.enum(NOTIFICATION_TYPES),
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

const cronExpression = z
  .string()
  .min(1, "Expression cron requise")
  .refine(
    (value) => {
      try {
        parseExpression(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Expression cron invalide" },
  );

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
