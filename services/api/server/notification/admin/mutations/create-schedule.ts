import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationSchedule,
  notificationTemplate,
} from "../../../../db/schema/notification/schema";
import { createScheduleValidator } from "../validators";
import {
  createTriggerSchedule,
  deleteTriggerSchedule,
} from "../../../../services/trigger-schedules";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";

export const createSchedule = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createScheduleValidator>;

  const [template] = await db
    .select({ id: notificationTemplate.id })
    .from(notificationTemplate)
    .where(eq(notificationTemplate.id, validated.templateId))
    .limit(1);
  if (!template) {
    return c.json({ error: "NotFound", message: "Template not found" }, 404);
  }

  const scheduleId = ulid();

  let triggerScheduleId: string | null = null;
  try {
    triggerScheduleId = await createTriggerSchedule({
      scheduleId,
      cron: validated.cronExpression,
      timezone: validated.timezone,
      isActive: validated.isActive,
    });
  } catch (err) {
    console.error("[create-schedule] trigger.dev schedules.create failed:", err);
    return c.json(
      { error: "InternalError", message: "Failed to register schedule in trigger.dev" },
      500,
    );
  }

  try {
    const [created] = await db
      .insert(notificationSchedule)
      .values({
        id: scheduleId,
        templateId: validated.templateId,
        name: validated.name,
        cronExpression: validated.cronExpression,
        timezone: validated.timezone,
        audience: validated.audience,
        defaultVariables: validated.defaultVariables,
        triggerScheduleId,
        isActive: validated.isActive,
      })
      .returning();
    return c.json(created, 201);
  } catch (err) {
    // DB insert failed → rollback the trigger.dev schedule we just created
    if (triggerScheduleId) {
      await deleteTriggerSchedule(triggerScheduleId).catch((rollbackErr) =>
        console.error("[create-schedule] rollback failed:", rollbackErr),
      );
    }
    throw err;
  }
};
