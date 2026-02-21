import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import { db } from "../../../db";
import { accountDeletionRequest } from "../../../db/schema/account-deletion-request/schema";
import { createAccountDeletionRequestValidator } from "../validators";

export const createAccountDeletionRequest = async (c: Context) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createAccountDeletionRequestValidator>;

    await db.insert(accountDeletionRequest).values({
      id: ulid(),
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
      clubName: validated.clubName,
      reason: validated.reason,
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};
