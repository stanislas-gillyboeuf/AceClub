import { Context } from "hono";
import { z } from "zod";
import { count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userReport, user } from "../../../db/schema";
import { listReportsValidator } from "../validators";

const reporter = alias(user, "reporter");
const reported = alias(user, "reported");

export const listReports = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listReportsValidator>;

  const where = validated.status ? eq(userReport.status, validated.status) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: userReport.id,
        reason: userReport.reason,
        context: userReport.context,
        status: userReport.status,
        createdAt: userReport.createdAt,
        reviewedAt: userReport.reviewedAt,
        reporter: { id: reporter.id, name: reporter.name, email: reporter.email },
        reported: { id: reported.id, name: reported.name, email: reported.email },
      })
      .from(userReport)
      .innerJoin(reporter, eq(reporter.id, userReport.reporterUserId))
      .innerJoin(reported, eq(reported.id, userReport.reportedUserId))
      .where(where)
      .orderBy(desc(userReport.createdAt))
      .limit(validated.limit)
      .offset(validated.offset),
    db.select({ total: count() }).from(userReport).where(where),
  ]);

  return c.json({ reports: rows, total, limit: validated.limit, offset: validated.offset });
};
