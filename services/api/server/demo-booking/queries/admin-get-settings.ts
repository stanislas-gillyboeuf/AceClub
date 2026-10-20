import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { getDemoAvailabilityRules, getDemoBookingSettings } from "../lib/settings";

export const getAdminSettings = async (c: Context<HonoContext>) => {
  const settings = await getDemoBookingSettings();
  const rules = await getDemoAvailabilityRules();
  return c.json({ settings, rules });
};
