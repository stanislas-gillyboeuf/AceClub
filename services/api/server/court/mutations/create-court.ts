import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { createCourtValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const createCourt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createCourtValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, body.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to create courts for this organization" },
      403,
    );
  }

  const [created] = await db
    .insert(court)
    .values({
      organizationId: body.organizationId,
      name: body.name,
      sport: body.sport,
      surface: body.surface,
      indoor: body.indoor,
      accessPolicy: body.accessPolicy,
      pricePerHour: body.pricePerHour,
      slotDurationMinutes: body.slotDurationMinutes,
      cancellationPolicy: body.cancellationPolicy,
      cancellationWindowHours: body.cancellationWindowHours,
    })
    .returning();

  return c.json(created, 201);
};
