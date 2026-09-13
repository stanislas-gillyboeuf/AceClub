import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { sendBatchNotifications } from "../../../services/expo-push/broadcast-service";
import { suggestSlotValidator } from "../validators";

export const suggestSlot = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof suggestSlotValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const [targetCourt] = await db
    .select({ name: court.name, organizationId: court.organizationId })
    .from(court)
    .where(eq(court.id, validated.courtId))
    .limit(1);

  if (!targetCourt || targetCourt.organizationId !== validated.organizationId) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const result = await sendBatchNotifications(validated.userIds, {
    type: "slot_suggestion",
    title: "Un créneau vient de se libérer",
    body: `${targetCourt.name} — ${validated.date} à ${String(validated.hour).padStart(2, "0")}h`,
    data: { courtId: validated.courtId, date: validated.date, hour: String(validated.hour) },
  });

  return c.json({ success: true, ...result });
};
