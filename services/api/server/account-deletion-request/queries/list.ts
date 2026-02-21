import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { accountDeletionRequest } from "../../../db/schema/account-deletion-request/schema";
import { desc } from "drizzle-orm";

export const listAccountDeletionRequests = async (c: Context<HonoContext>) => {
  try {
    const requests = await db
      .select()
      .from(accountDeletionRequest)
      .orderBy(desc(accountDeletionRequest.createdAt));

    return c.json({ requests });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};
