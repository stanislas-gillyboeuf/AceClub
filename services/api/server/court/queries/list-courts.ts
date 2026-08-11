import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { listCourtsValidator } from "../validators";

export const listCourts = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listCourtsValidator>;

  const courts = await db
    .select()
    .from(court)
    .where(and(eq(court.organizationId, query.organizationId), eq(court.isActive, true)));

  return c.json(courts);
};
