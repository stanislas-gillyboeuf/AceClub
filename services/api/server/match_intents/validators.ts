import { z } from "zod";

export const createMatchIntentValidator = z.object({
  date: z.string(),
  time: z.string(),
  duration: z.number(),
});