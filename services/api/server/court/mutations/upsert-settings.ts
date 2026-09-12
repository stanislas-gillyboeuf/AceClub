import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtSettings } from "../../../db/schema";
import { upsertSettingsValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const upsertSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof upsertSettingsValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, body.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to update settings for this organization" },
      403,
    );
  }

  const [updated] = await db
    .insert(courtSettings)
    .values({
      organizationId: body.organizationId,
      openingHour: body.openingHour,
      closingHour: body.closingHour,
      maxBookingsPerWeekWeekday: body.maxBookingsPerWeekWeekday ?? null,
      maxBookingsPerWeekWeekend: body.maxBookingsPerWeekWeekend ?? null,
      bookingWindowDays: body.bookingWindowDays ?? null,
    })
    .onConflictDoUpdate({
      target: courtSettings.organizationId,
      set: {
        openingHour: body.openingHour,
        closingHour: body.closingHour,
        maxBookingsPerWeekWeekday: body.maxBookingsPerWeekWeekday ?? null,
        maxBookingsPerWeekWeekend: body.maxBookingsPerWeekWeekend ?? null,
        bookingWindowDays: body.bookingWindowDays ?? null,
      },
    })
    .returning();

  return c.json(updated);
};
