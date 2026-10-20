import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { slotsQueryValidator } from "../validators";
import { loadSlotComputationContext } from "../lib/load-context";
import { computeAvailableSlots } from "../lib/slot-calculator";
import { dateStringInTimeZone } from "../lib/timezone";

export const getSlots = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof slotsQueryValidator>;

  const context = await loadSlotComputationContext();
  const slots = computeAvailableSlots(context)
    .filter((s) => dateStringInTimeZone(s.start, context.settings.referenceTimezone) === query.date)
    .map((s) => ({ startAt: s.start.toISOString(), endAt: s.end.toISOString() }));

  return c.json({
    date: query.date,
    durationMinutes: context.settings.demoDurationMinutes,
    slots,
  });
};
