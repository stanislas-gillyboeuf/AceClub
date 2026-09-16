import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { subscriptionType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createTypeValidator } from "../validators";

export const createType = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createTypeValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [created] = await db
    .insert(subscriptionType)
    .values({
      organizationId: validated.organizationId,
      name: validated.name,
      priceCents: validated.priceCents ?? null,
      durationDays: validated.durationDays ?? null,
    })
    .returning();

  return c.json(created, 201);
};
