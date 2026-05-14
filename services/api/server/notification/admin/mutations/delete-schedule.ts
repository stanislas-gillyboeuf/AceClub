import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import { notificationSchedule } from "../../../../db/schema/notification/schema";
import { deleteTriggerSchedule } from "../../../../services/trigger-schedules";
import { eq } from "drizzle-orm";

export const deleteSchedule = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(notificationSchedule)
    .where(eq(notificationSchedule.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Schedule not found" }, 404);
  }

  if (existing.triggerScheduleId) {
    try {
      await deleteTriggerSchedule(existing.triggerScheduleId);
    } catch (err) {
      console.error("[delete-schedule] trigger.dev delete failed:", err);
      // Continue and remove the DB row anyway — the trigger schedule may be already gone
    }
  }

  await db.delete(notificationSchedule).where(eq(notificationSchedule.id, id));
  return c.json({ success: true });
};
