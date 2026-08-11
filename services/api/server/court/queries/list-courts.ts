import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { listCourtsValidator } from "../validators";
import { canAccessCourt } from "../lib/access";

export const listCourts = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listCourtsValidator>;

  const courts = await db
    .select()
    .from(court)
    .where(and(eq(court.organizationId, query.organizationId), eq(court.isActive, true)));

  const accessible = await Promise.all(
    courts.map(async (row) => ({
      court: row,
      allowed: await canAccessCourt(currentUser.id, row.organizationId, row.accessPolicy),
    })),
  );

  return c.json(accessible.filter((row) => row.allowed).map((row) => row.court));
};
