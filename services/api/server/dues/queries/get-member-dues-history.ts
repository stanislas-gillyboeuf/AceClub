import { Context } from "hono";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesAssignment, duesType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getMemberDuesHistoryValidator } from "../validators";

export const getMemberDuesHistory = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getMemberDuesHistoryValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const rows = await db
    .select({
      id: duesAssignment.id,
      status: duesAssignment.status,
      paidAt: duesAssignment.paidAt,
      paidMethod: duesAssignment.paidMethod,
      duesTypeName: duesType.name,
      amountCents: duesType.amountCents,
      dueDate: duesType.dueDate,
    })
    .from(duesAssignment)
    .innerJoin(duesType, eq(duesAssignment.duesTypeId, duesType.id))
    .where(
      and(
        eq(duesAssignment.organizationId, validated.organizationId),
        eq(duesAssignment.userId, validated.userId),
      ),
    )
    .orderBy(desc(duesType.createdAt));

  return c.json(rows);
};
