import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { weeklyQuotaValidator } from "../validators";
import { getCourtSettings } from "../lib/settings";
import { countWeeklyBookings } from "../lib/quota";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";

export const getWeeklyQuota = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof weeklyQuotaValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const [settings, usage] = await Promise.all([
    getCourtSettings(query.organizationId),
    countWeeklyBookings(currentUser.id, query.organizationId, new Date()),
  ]);

  return c.json({
    weekday: { used: usage.weekday, limit: settings.maxBookingsPerWeekWeekday },
    weekend: { used: usage.weekend, limit: settings.maxBookingsPerWeekWeekend },
  });
};
