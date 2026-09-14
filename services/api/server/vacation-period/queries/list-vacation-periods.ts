import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { vacationPeriod } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listVacationPeriodsValidator } from "../validators";

export const listVacationPeriods = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listVacationPeriodsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const rows = await db
    .select()
    .from(vacationPeriod)
    .where(eq(vacationPeriod.organizationId, validated.organizationId))
    .orderBy(asc(vacationPeriod.startDate));

  return c.json({ vacationPeriods: rows });
};
