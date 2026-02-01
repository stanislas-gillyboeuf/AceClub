import { z } from "zod";

export const createMatchIntentValidator = z.object({
  date: z.string(),
  time: z.string(),
  duration: z.number(),
  type: z.enum(["match", "training"]).optional().default("match"),
  description: z.string().optional(),
});
