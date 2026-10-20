import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { getGoogleCalendarAuthUrl } from "../../../lib/google-calendar";

export const getGoogleAuthUrl = async (c: Context<HonoContext>) => {
  return c.json({ url: getGoogleCalendarAuthUrl() });
};
