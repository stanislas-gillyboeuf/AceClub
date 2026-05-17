import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { eventParticipant } from "../../../db/schema/event/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminRemoveParticipantValidator } from "../validators";

export const adminRemoveParticipant = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof adminRemoveParticipantValidator>;

  const [deleted] = await db
    .delete(eventParticipant)
    .where(eq(eventParticipant.id, body.participantId))
    .returning({ id: eventParticipant.id });

  if (!deleted) {
    return c.json({ error: "NotFound", message: "Participant not found" }, 404);
  }

  return c.json({ success: true });
};
