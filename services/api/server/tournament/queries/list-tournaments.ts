import { Context } from "hono";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, tournament } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listTournamentsValidator } from "../validators";

export const listTournaments = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listTournamentsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const rows = await db
    .select({
      id: tournament.id,
      eventId: tournament.eventId,
      sport: tournament.sport,
      format: tournament.format,
      drawSize: tournament.drawSize,
      status: tournament.status,
      eventName: event.name,
      eventStartDate: event.startDate,
    })
    .from(tournament)
    .innerJoin(event, eq(tournament.eventId, event.id))
    .where(eq(tournament.organizationId, validated.organizationId))
    .orderBy(desc(event.startDate));

  return c.json({ tournaments: rows });
};
