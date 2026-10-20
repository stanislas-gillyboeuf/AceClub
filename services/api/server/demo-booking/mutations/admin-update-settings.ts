import { Context } from "hono";
import { z } from "zod";
import { db } from "../../../db";
import { demoBookingSettings, demoAvailabilityRule } from "../../../db/schema";
import { updateDemoBookingSettingsValidator } from "../validators";
import type { HonoContext } from "../../../types/hono";

export const updateAdminSettings = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateDemoBookingSettingsValidator>;

  await db.transaction(async (tx) => {
    await tx
      .insert(demoBookingSettings)
      .values({
        id: "singleton",
        demoDurationMinutes: body.demoDurationMinutes,
        bufferBeforeMinutes: body.bufferBeforeMinutes,
        bufferAfterMinutes: body.bufferAfterMinutes,
        minNoticeHours: body.minNoticeHours,
        horizonDays: body.horizonDays,
        maxPerDay: body.maxPerDay,
        referenceTimezone: body.referenceTimezone,
      })
      .onConflictDoUpdate({
        target: demoBookingSettings.id,
        set: {
          demoDurationMinutes: body.demoDurationMinutes,
          bufferBeforeMinutes: body.bufferBeforeMinutes,
          bufferAfterMinutes: body.bufferAfterMinutes,
          minNoticeHours: body.minNoticeHours,
          horizonDays: body.horizonDays,
          maxPerDay: body.maxPerDay,
          referenceTimezone: body.referenceTimezone,
        },
      });

    await tx.delete(demoAvailabilityRule);
    if (body.rules.length > 0) {
      await tx.insert(demoAvailabilityRule).values(
        body.rules.map((rule) => ({
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
        })),
      );
    }
  });

  return c.json({ ok: true });
};
