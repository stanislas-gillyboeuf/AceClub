import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { vacationPeriod } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createVacationPeriodValidator } from "../validators";

export const createVacationPeriod = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createVacationPeriodValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [created] = await db
    .insert(vacationPeriod)
    .values({
      organizationId: validated.organizationId,
      name: validated.name,
      startDate: new Date(`${validated.startDate}T00:00:00Z`),
      endDate: new Date(`${validated.endDate}T00:00:00Z`),
    })
    .returning();

  return c.json(created, 201);
};
