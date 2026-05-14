import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationSchedule,
  notificationTemplate,
} from "../../../../db/schema/notification/schema";
import { eq, desc } from "drizzle-orm";

export const listSchedules = async (c: Context<HonoContext>) => {
  const rows = await db
    .select({
      id: notificationSchedule.id,
      templateId: notificationSchedule.templateId,
      templateType: notificationTemplate.type,
      name: notificationSchedule.name,
      cronExpression: notificationSchedule.cronExpression,
      timezone: notificationSchedule.timezone,
      audience: notificationSchedule.audience,
      defaultVariables: notificationSchedule.defaultVariables,
      isActive: notificationSchedule.isActive,
      lastRunAt: notificationSchedule.lastRunAt,
      createdAt: notificationSchedule.createdAt,
      updatedAt: notificationSchedule.updatedAt,
    })
    .from(notificationSchedule)
    .innerJoin(notificationTemplate, eq(notificationSchedule.templateId, notificationTemplate.id))
    .orderBy(desc(notificationSchedule.createdAt));

  return c.json({ schedules: rows });
};
