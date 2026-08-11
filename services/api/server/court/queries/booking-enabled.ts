import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { resolveFeatureFlag } from "../../../lib/feature-flags";
import { bookingEnabledValidator } from "../validators";

export const getBookingEnabled = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof bookingEnabledValidator>;

  const enabled = await resolveFeatureFlag("court_booking", query.organizationId);

  return c.json({ enabled });
};
