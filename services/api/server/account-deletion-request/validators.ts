import { z } from "zod";

export const createAccountDeletionRequestValidator = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  clubName: z.string().min(1),
  reason: z.string().optional(),
});
