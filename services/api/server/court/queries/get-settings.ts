import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { courtSettingsQueryValidator } from "../validators";
import { getCourtSettings } from "../lib/settings";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";

export const getSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof courtSettingsQueryValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const settings = await getCourtSettings(query.organizationId);

  return c.json(settings);
};
