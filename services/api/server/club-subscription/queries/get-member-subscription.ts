import { Context } from "hono";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { memberSubscription, subscriptionType } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getMemberSubscriptionValidator } from "../validators";

export const getMemberSubscription = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getMemberSubscriptionValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const [latest] = await db
    .select({
      id: memberSubscription.id,
      startDate: memberSubscription.startDate,
      endDate: memberSubscription.endDate,
      amountDueCents: memberSubscription.amountDueCents,
      status: memberSubscription.status,
      typeName: subscriptionType.name,
      typePriceCents: subscriptionType.priceCents,
    })
    .from(memberSubscription)
    .innerJoin(subscriptionType, eq(memberSubscription.subscriptionTypeId, subscriptionType.id))
    .where(
      and(
        eq(memberSubscription.organizationId, validated.organizationId),
        eq(memberSubscription.userId, validated.userId),
      ),
    )
    .orderBy(desc(memberSubscription.startDate))
    .limit(1);

  return c.json(latest ?? null);
};
