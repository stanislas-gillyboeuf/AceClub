import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, tournament } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createTournamentValidator } from "../validators";

// Mirrors event/mutations/create.ts's insert shape and rules (status hardcoded "on_sale",
// isFree||paymentLink required) — small deliberate duplication rather than refactoring the
// event domain's HTTP handler into a shared function for this one call site.
export const createTournament = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createTournamentValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, body.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (!body.isFree && !body.paymentLink) {
    return c.json(
      { error: "BadRequest", message: "Payment link is required for paid events" },
      400,
    );
  }

  const created = await db.transaction(async (tx) => {
    const [newEvent] = await tx
      .insert(event)
      .values({
        name: body.name,
        description: body.description,
        coverImage: body.coverImage,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        maxParticipants: body.maxParticipants,
        isFree: body.isFree,
        price: body.isFree ? null : body.price,
        paymentLink: body.isFree ? null : body.paymentLink,
        visibility: body.visibility,
        status: "on_sale",
        userId: currentUser.id,
        organizationId: body.organizationId,
      })
      .returning();

    const [newTournament] = await tx
      .insert(tournament)
      .values({
        eventId: newEvent.id,
        organizationId: body.organizationId,
        sport: body.sport,
        drawSize: body.drawSize,
      })
      .returning();

    return { ...newTournament, event: newEvent };
  });

  return c.json(created, 201);
};
