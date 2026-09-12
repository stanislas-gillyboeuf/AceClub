import { Context } from "hono";
import { z } from "zod";
import { and, count, eq, ilike, inArray, max, or } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesAssignment, duesReminderLog, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listAssignmentsValidator } from "../validators";

export const listAssignments = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listAssignmentsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const conditions = [eq(duesAssignment.organizationId, validated.organizationId)];
  if (validated.duesTypeId) conditions.push(eq(duesAssignment.duesTypeId, validated.duesTypeId));
  if (validated.status) conditions.push(eq(duesAssignment.status, validated.status));
  if (validated.search) {
    conditions.push(
      or(
        ilike(user.name, `%${validated.search}%`),
        ilike(user.email, `%${validated.search}%`),
      )!,
    );
  }
  const whereClause = and(...conditions);

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: duesAssignment.id,
        duesTypeId: duesAssignment.duesTypeId,
        status: duesAssignment.status,
        paidAt: duesAssignment.paidAt,
        paidMethod: duesAssignment.paidMethod,
        notes: duesAssignment.notes,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(duesAssignment)
      .innerJoin(user, eq(duesAssignment.userId, user.id))
      .where(whereClause)
      .orderBy(user.name)
      .limit(validated.limit)
      .offset(validated.offset),
    db
      .select({ count: count() })
      .from(duesAssignment)
      .innerJoin(user, eq(duesAssignment.userId, user.id))
      .where(whereClause),
  ]);

  const assignmentIds = rows.map((r) => r.id);
  const lastReminders = assignmentIds.length
    ? await db
        .select({
          duesAssignmentId: duesReminderLog.duesAssignmentId,
          lastSentAt: max(duesReminderLog.sentAt),
        })
        .from(duesReminderLog)
        .where(inArray(duesReminderLog.duesAssignmentId, assignmentIds))
        .groupBy(duesReminderLog.duesAssignmentId)
    : [];
  const lastReminderByAssignment = new Map(
    lastReminders.map((r) => [r.duesAssignmentId, r.lastSentAt]),
  );

  return c.json({
    assignments: rows.map((row) => ({
      ...row,
      lastReminderAt: lastReminderByAssignment.get(row.id) ?? null,
    })),
    total: totalResult[0]?.count ?? 0,
  });
};
