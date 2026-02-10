import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateVenueValidator } from "../validators";
import { db } from "../../../db";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const updateVenue = async (c: Context<HonoContext>) => {
  try {
    const matchId = c.req.param("id");
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateVenueValidator>;
    const currentUser = c.get("user")!;

    if (!matchId) {
      return c.json({ error: "BadRequest", message: "Match ID is required" }, 400);
    }

    // Fetch match
    const [foundMatch] = await db
      .select()
      .from(match)
      .where(eq(match.id, matchId))
      .limit(1);

    if (!foundMatch) {
      return c.json({ error: "NotFound", message: "Match not found" }, 404);
    }

    // Validate caller is a participant
    const participants = await db
      .select()
      .from(matchParticipant)
      .where(eq(matchParticipant.matchId, matchId));

    const isParticipant = participants.some((p) => p.userId === currentUser.id);
    if (!isParticipant) {
      return c.json(
        { error: "Forbidden", message: "Only match participants can update the venue" },
        403,
      );
    }

    // Validate organization exists (if not null)
    if (validated.venueOrganizationId) {
      const [org] = await db
        .select()
        .from(organization)
        .where(eq(organization.id, validated.venueOrganizationId))
        .limit(1);

      if (!org) {
        return c.json(
          { error: "NotFound", message: "Organization not found" },
          404,
        );
      }
    }

    // Update venue
    const [updatedMatch] = await db
      .update(match)
      .set({ venueOrganizationId: validated.venueOrganizationId })
      .where(eq(match.id, matchId))
      .returning();

    // Fetch venue organization details if set
    let venueOrganization = null;
    if (updatedMatch.venueOrganizationId) {
      const [org] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          address: organization.address,
          latitude: organization.latitude,
          longitude: organization.longitude,
        })
        .from(organization)
        .where(eq(organization.id, updatedMatch.venueOrganizationId))
        .limit(1);

      venueOrganization = org || null;
    }

    return c.json({
      success: true,
      match: updatedMatch,
      venueOrganization,
    });
  } catch (error) {
    return c.json(
      { error: "Internal server error", message: (error as Error).message },
      500,
    );
  }
};
