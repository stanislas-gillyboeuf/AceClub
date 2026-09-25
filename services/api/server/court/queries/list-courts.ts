import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { listCourtsValidator } from "../validators";
import { assertCanViewOrg, forbidden } from "../../../lib/club-access";

export const listCourts = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listCourtsValidator>;

  if (!(await assertCanViewOrg(currentUser, query.organizationId))) return forbidden(c);

  const courts = await db
    .select()
    .from(court)
    .where(and(eq(court.organizationId, query.organizationId), eq(court.isActive, true)));

  return c.json(courts);
};
