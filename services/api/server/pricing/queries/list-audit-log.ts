import { Context } from "hono";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifGridAuditLog, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listAuditLogValidator } from "../validators";

export const listAuditLog = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listAuditLogValidator>;

  const [grid] = await db
    .select({ organizationId: tarifGrid.organizationId })
    .from(tarifGrid)
    .where(eq(tarifGrid.id, validated.tarifGridId))
    .limit(1);
  if (!grid) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, grid.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const logs = await db
    .select({
      id: tarifGridAuditLog.id,
      action: tarifGridAuditLog.action,
      summary: tarifGridAuditLog.summary,
      createdAt: tarifGridAuditLog.createdAt,
      actorUserId: tarifGridAuditLog.actorUserId,
      actorName: user.name,
    })
    .from(tarifGridAuditLog)
    .innerJoin(user, eq(user.id, tarifGridAuditLog.actorUserId))
    .where(eq(tarifGridAuditLog.tarifGridId, validated.tarifGridId))
    .orderBy(desc(tarifGridAuditLog.createdAt));

  return c.json({ logs });
};
