import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { eventParticipant } from "../../../db/schema/event/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { cancelRegistrationValidator } from "../validators";

export const cancelRegistration = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof cancelRegistrationValidator>;

  const [registration] = await db
    .select()
    .from(eventParticipant)
    .where(
      and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.userId, currentUser.id)),
    )
    .limit(1);

  if (!registration) {
    return c.json({ error: "NotFound", message: "Registration not found" }, 404);
  }

  if (registration.status === "cancelled") {
    return c.json({ error: "BadRequest", message: "Registration already cancelled" }, 400);
  }

  const wasRegistered = registration.status === "registered";

  await db
    .update(eventParticipant)
    .set({ status: "cancelled" })
    .where(eq(eventParticipant.id, registration.id));

  if (wasRegistered) {
    const [nextWaitlisted] = await db
      .select()
      .from(eventParticipant)
      .where(
        and(eq(eventParticipant.eventId, body.eventId), eq(eventParticipant.status, "waitlisted")),
      )
      .orderBy(asc(eventParticipant.registeredAt))
      .limit(1);

    if (nextWaitlisted) {
      await db
        .update(eventParticipant)
        .set({ status: "registered" })
        .where(eq(eventParticipant.id, nextWaitlisted.id));
    }
  }

  return c.json({ success: true });
};
