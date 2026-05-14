import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import { notificationSchedule } from "../../../../db/schema/notification/schema";
import { updateScheduleValidator } from "../validators";
import { updateTriggerSchedule } from "../../../../services/trigger-schedules";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const updateSchedule = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateScheduleValidator>;

  const [existing] = await db
    .select()
    .from(notificationSchedule)
    .where(eq(notificationSchedule.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Schedule not found" }, 404);
  }

  const merged = {
    name: validated.name ?? existing.name,
    cronExpression: validated.cronExpression ?? existing.cronExpression,
    timezone: validated.timezone ?? existing.timezone,
    audience: validated.audience ?? existing.audience,
    defaultVariables: validated.defaultVariables ?? existing.defaultVariables,
    isActive: validated.isActive ?? existing.isActive,
  };

  if (existing.triggerScheduleId) {
    try {
      await updateTriggerSchedule({
        triggerScheduleId: existing.triggerScheduleId,
        scheduleId: id,
        cron: merged.cronExpression,
        timezone: merged.timezone,
        isActive: merged.isActive,
      });
    } catch (err) {
      console.error("[update-schedule] trigger.dev update failed:", err);
      return c.json(
        { error: "InternalError", message: "Failed to update schedule in trigger.dev" },
        500,
      );
    }
  }

  const [updated] = await db
    .update(notificationSchedule)
    .set(merged)
    .where(eq(notificationSchedule.id, id))
    .returning();

  return c.json(updated);
};
