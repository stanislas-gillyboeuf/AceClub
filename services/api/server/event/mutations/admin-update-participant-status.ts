import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { eventParticipant } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminUpdateParticipantStatusValidator } from "../validators";

export const adminUpdateParticipantStatus = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof adminUpdateParticipantStatusValidator>;

  const [updated] = await db
    .update(eventParticipant)
    .set({ status: body.status })
    .where(eq(eventParticipant.id, body.participantId))
    .returning();

  if (!updated) {
    return c.json({ error: "NotFound", message: "Participant not found" }, 404);
  }

  return c.json(updated);
};
