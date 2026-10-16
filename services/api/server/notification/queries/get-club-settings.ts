import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { clubNotificationSettingsQueryValidator } from "../validators";
import { getClubNotificationSettings } from "../../../lib/notification-gate";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";

export const getClubSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof clubNotificationSettingsQueryValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const settings = await getClubNotificationSettings(query.organizationId);

  return c.json(settings);
};
