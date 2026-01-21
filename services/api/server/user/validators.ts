import { z } from "zod";

export const searchUsersValidator = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});
