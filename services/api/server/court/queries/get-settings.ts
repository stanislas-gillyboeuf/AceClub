import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { courtSettingsQueryValidator } from "../validators";
import { getCourtSettings } from "../lib/settings";

export const getSettings = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof courtSettingsQueryValidator>;

  const settings = await getCourtSettings(query.organizationId);

  return c.json(settings);
};
