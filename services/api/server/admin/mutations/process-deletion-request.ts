import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { processDeletionRequestValidator } from "../validators";
import { db } from "../../../db";
import { accountDeletionRequest } from "../../../db/schema/account-deletion-request/schema";
import { eq } from "drizzle-orm";

export const processDeletionRequest = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof processDeletionRequestValidator>;
    const user = c.get("user");

    const [existing] = await db
      .select()
      .from(accountDeletionRequest)
      .where(eq(accountDeletionRequest.id, validated.requestId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "NotFound", message: "Deletion request not found" }, 404);
    }

    const [updated] = await db
      .update(accountDeletionRequest)
      .set({
        status: validated.status,
        processedAt: new Date(),
        processedBy: user!.id,
      })
      .where(eq(accountDeletionRequest.id, validated.requestId))
      .returning();

    return c.json({ success: true, request: updated });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};
