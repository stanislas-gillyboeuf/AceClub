import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { messagingSettingsQueryValidator } from "../validators";
import { isCourseMessagingEnabled } from "../lib/messaging-settings";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";

export const getMessagingSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof messagingSettingsQueryValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const enabled = await isCourseMessagingEnabled(query.organizationId);

  return c.json({ enabled });
};
