import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateMemberRoleValidator } from "../validators";

/**
 * Direct DB write rather than Better Auth's own `updateMemberRole` — this club-dashboard
 * concern needs a "coach" role value, and there's no `ac`/roles config declaring it as a
 * known role to that plugin, so going through its API risks rejection. `member.role` is a
 * plain text column with no enum constraint, so writing it directly is safe.
 */
export const updateMemberRole = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateMemberRoleValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [existing] = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, validated.organizationId), eq(member.userId, validated.userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Member not found" }, 404);
  }

  if (existing.role === "owner") {
    return c.json({ error: "Forbidden", message: "The club owner's role can't be changed here" }, 403);
  }

  const [updated] = await db
    .update(member)
    .set({ role: validated.role })
    .where(eq(member.id, existing.id))
    .returning();

  return c.json(updated);
};
