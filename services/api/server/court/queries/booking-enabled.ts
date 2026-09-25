import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { resolveFeatureFlag } from "../../../lib/feature-flags";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";
import { bookingEnabledValidator } from "../validators";

export const getBookingEnabled = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof bookingEnabledValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const enabled = await resolveFeatureFlag("court_booking", query.organizationId);

  return c.json({ enabled });
};
