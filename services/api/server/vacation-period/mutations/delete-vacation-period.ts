import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { vacationPeriod } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteVacationPeriodValidator } from "../validators";

export const deleteVacationPeriod = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteVacationPeriodValidator>;

  const [existing] = await db
    .select({ id: vacationPeriod.id, organizationId: vacationPeriod.organizationId })
    .from(vacationPeriod)
    .where(eq(vacationPeriod.id, validated.vacationPeriodId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Vacation period not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  await db.delete(vacationPeriod).where(eq(vacationPeriod.id, existing.id));

  return c.json({ success: true });
};
