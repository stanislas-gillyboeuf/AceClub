import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userReport } from "../../../db/schema";
import { updateReportStatusValidator } from "../validators";

export const updateReportStatus = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const reportId = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateReportStatusValidator>;

  const [updated] = await db
    .update(userReport)
    .set({
      status: validated.status,
      reviewedAt: new Date(),
      reviewedByUserId: currentUser.id,
    })
    .where(eq(userReport.id, reportId))
    .returning();

  if (!updated) {
    return c.json({ error: "NotFound", message: "Report not found" }, 404);
  }

  return c.json(updated);
};
