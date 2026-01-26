import { z } from "zod";

export const createMatchIntentValidator = z.object({
  userId: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.number(),
  
});