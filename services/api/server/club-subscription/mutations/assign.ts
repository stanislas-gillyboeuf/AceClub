import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { memberSubscription, subscriptionType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { assignSubscriptionValidator } from "../validators";

export const assign = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof assignSubscriptionValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [type] = await db
    .select()
    .from(subscriptionType)
    .where(
      and(
        eq(subscriptionType.id, validated.subscriptionTypeId),
        eq(subscriptionType.organizationId, validated.organizationId),
      ),
    )
    .limit(1);

  if (!type) {
    return c.json({ error: "NotFound", message: "Subscription type not found" }, 404);
  }

  const startDate = new Date();
  const endDate = type.durationDays
    ? new Date(startDate.getTime() + type.durationDays * 24 * 60 * 60 * 1000)
    : null;

  const [created] = await db
    .insert(memberSubscription)
    .values({
      organizationId: validated.organizationId,
      userId: validated.userId,
      subscriptionTypeId: validated.subscriptionTypeId,
      startDate,
      endDate,
      amountDueCents: validated.amountDueCents,
    })
    .returning();

  return c.json(created, 201);
};
