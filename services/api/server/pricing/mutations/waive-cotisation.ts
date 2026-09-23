import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { memberCotisation } from "../../../db/schema";
import type { HonoContext } from "../../../types/hono";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { ensureMemberCotisationRecord } from "../lib/member-cotisation";
import { waiveCotisationValidator } from "../validators";

export const waiveCotisation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof waiveCotisationValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const result = await ensureMemberCotisationRecord(
    validated.organizationId,
    validated.userId,
    validated.seasonLabel,
  );

  if ("error" in result) {
    if (result.error === "incomplete") {
      return c.json(
        { error: "BadRequest", message: "This member's profile is missing data the grid needs", missingFields: result.missingFields },
        400,
      );
    }
    return c.json(
      { error: "NotFound", message: result.error === "no_active_grid" ? "No active pricing grid for this season" : "Member not found" },
      404,
    );
  }

  const [updated] = await db
    .update(memberCotisation)
    .set({ status: "waived", notes: validated.notes ?? null })
    .where(eq(memberCotisation.id, result.record.id))
    .returning();

  return c.json(updated);
};
