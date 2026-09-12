import { Context } from "hono";
import { z } from "zod";
import { count, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesType, duesAssignment } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listDuesTypesValidator } from "../validators";

export const listDuesTypes = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listDuesTypesValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const types = await db
    .select()
    .from(duesType)
    .where(eq(duesType.organizationId, validated.organizationId))
    .orderBy(duesType.createdAt);

  const counts = await db
    .select({ duesTypeId: duesAssignment.duesTypeId, status: duesAssignment.status, count: count() })
    .from(duesAssignment)
    .where(eq(duesAssignment.organizationId, validated.organizationId))
    .groupBy(duesAssignment.duesTypeId, duesAssignment.status);

  const summaryByType = new Map<string, { pending: number; paid: number; waived: number }>();
  for (const row of counts) {
    const entry = summaryByType.get(row.duesTypeId) ?? { pending: 0, paid: 0, waived: 0 };
    entry[row.status] = row.count;
    summaryByType.set(row.duesTypeId, entry);
  }

  return c.json(
    types.map((type) => ({
      ...type,
      summary: summaryByType.get(type.id) ?? { pending: 0, paid: 0, waived: 0 },
    })),
  );
};
