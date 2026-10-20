import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { availabilityQueryValidator } from "../validators";
import { loadSlotComputationContext } from "../lib/load-context";
import { computeAvailableSlots } from "../lib/slot-calculator";
import { dateStringInTimeZone } from "../lib/timezone";

export const getAvailability = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof availabilityQueryValidator>;

  const context = await loadSlotComputationContext();
  const slots = computeAvailableSlots(context);

  const datesWithSlots = new Set<string>();
  for (const slot of slots) {
    const dateString = dateStringInTimeZone(slot.start, context.settings.referenceTimezone);
    if (dateString.startsWith(query.yearMonth)) datesWithSlots.add(dateString);
  }

  return c.json({ dates: Array.from(datesWithSlots).sort() });
};
