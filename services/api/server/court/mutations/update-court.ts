import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { updateCourtValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const updateCourt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateCourtValidator>;

  const [existing] = await db.select().from(court).where(eq(court.id, body.courtId)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, existing.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Not authorized to update this court" }, 403);
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.sport !== undefined) updateData.sport = body.sport;
  if (body.surface !== undefined) updateData.surface = body.surface;
  if (body.indoor !== undefined) updateData.indoor = body.indoor;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.accessPolicy !== undefined) updateData.accessPolicy = body.accessPolicy;
  if (body.pricePerHour !== undefined) updateData.pricePerHour = body.pricePerHour;
  if (body.slotDurationMinutes !== undefined) updateData.slotDurationMinutes = body.slotDurationMinutes;
  if (body.cancellationPolicy !== undefined) updateData.cancellationPolicy = body.cancellationPolicy;
  if (body.cancellationWindowHours !== undefined)
    updateData.cancellationWindowHours = body.cancellationWindowHours;

  const [updated] = await db
    .update(court)
    .set(updateData)
    .where(eq(court.id, body.courtId))
    .returning();

  return c.json(updated);
};
