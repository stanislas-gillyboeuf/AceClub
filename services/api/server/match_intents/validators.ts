import { z } from "zod";

export const createMatchIntentValidator = z
  .object({
    date: z.string().optional(),
    time: z.string().optional(),
    isFlexibleDate: z.boolean().optional().default(false),
    duration: z.number(),
    type: z.enum(["match", "training"]).optional().default("match"),
    description: z.string().optional(),
    /** Pre-filled padel teammate user IDs (existing users/ghosts only), slot order = array order. */
    teammateUserIds: z.array(z.string().min(1)).max(3).optional().default([]),
  })
  .refine((data) => data.isFlexibleDate || (!!data.date && !!data.time), {
    message: "date and time are required unless isFlexibleDate is true",
    path: ["date"],
  });

export const createRequestValidator = z.object({
  slotIndex: z.number().int().min(0).max(2).optional(),
});
