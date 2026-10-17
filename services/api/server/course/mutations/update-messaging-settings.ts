import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courseMessagingSettings } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateMessagingSettingsValidator } from "../validators";

export const updateMessagingSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof updateMessagingSettingsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, body.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [updated] = await db
    .insert(courseMessagingSettings)
    .values({ organizationId: body.organizationId, enabled: body.enabled })
    .onConflictDoUpdate({
      target: courseMessagingSettings.organizationId,
      set: { enabled: body.enabled },
    })
    .returning();

  return c.json(updated);
};
