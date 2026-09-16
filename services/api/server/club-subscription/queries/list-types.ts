import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { subscriptionType } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { listTypesValidator } from "../validators";

export const listTypes = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listTypesValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const types = await db
    .select()
    .from(subscriptionType)
    .where(eq(subscriptionType.organizationId, validated.organizationId))
    .orderBy(asc(subscriptionType.name));

  return c.json(types);
};
