import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { weeklyQuotaValidator } from "../validators";
import { getCourtSettings } from "../lib/settings";
import { countWeeklyBookings } from "../lib/quota";

export const getWeeklyQuota = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof weeklyQuotaValidator>;

  const [settings, usage] = await Promise.all([
    getCourtSettings(query.organizationId),
    countWeeklyBookings(currentUser.id, query.organizationId, new Date()),
  ]);

  return c.json({
    weekday: { used: usage.weekday, limit: settings.maxBookingsPerWeekWeekday },
    weekend: { used: usage.weekend, limit: settings.maxBookingsPerWeekWeekend },
  });
};
