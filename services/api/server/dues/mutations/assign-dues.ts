import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesType, duesAssignment, member, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { assignDuesValidator } from "../validators";

export const assignDues = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof assignDuesValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [type] = await db
    .select({ id: duesType.id, organizationId: duesType.organizationId })
    .from(duesType)
    .where(eq(duesType.id, validated.duesTypeId))
    .limit(1);

  if (!type || type.organizationId !== validated.organizationId) {
    return c.json({ error: "NotFound", message: "Dues type not found" }, 404);
  }

  let targetUserIds: string[];
  if (validated.allActiveMembers) {
    const rows = await db
      .select({ userId: member.userId })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, validated.organizationId));
    targetUserIds = rows.map((r) => r.userId);
  } else {
    targetUserIds = validated.userIds!;
  }

  if (targetUserIds.length === 0) {
    return c.json({ assigned: 0 });
  }

  const inserted = await db
    .insert(duesAssignment)
    .values(
      targetUserIds.map((userId) => ({
        id: ulid(),
        duesTypeId: validated.duesTypeId,
        userId,
        organizationId: validated.organizationId,
      })),
    )
    .onConflictDoNothing({ target: [duesAssignment.duesTypeId, duesAssignment.userId] })
    .returning({ id: duesAssignment.id });

  return c.json({ assigned: inserted.length }, 201);
};
