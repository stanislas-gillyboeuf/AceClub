import { Context } from "hono";
import { z } from "zod";
import { and, count, eq, inArray, ne } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateRestrictedAccessValidator } from "../validators";

export const updateRestrictedAccess = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateRestrictedAccessValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (validated.restrictedDashboardAccess) {
    const [remainingFullAdmins] = await db
      .select({ count: count() })
      .from(member)
      .where(
        and(
          eq(member.organizationId, validated.organizationId),
          inArray(member.role, ["owner", "admin"]),
          eq(member.restrictedDashboardAccess, false),
          ne(member.userId, validated.userId),
        ),
      );

    if ((remainingFullAdmins?.count ?? 0) === 0) {
      return c.json(
        {
          error: "Conflict",
          message: "Le club doit garder au moins un administrateur complet",
        },
        409,
      );
    }
  }

  const [updated] = await db
    .update(member)
    .set({ restrictedDashboardAccess: validated.restrictedDashboardAccess })
    .where(
      and(eq(member.organizationId, validated.organizationId), eq(member.userId, validated.userId)),
    )
    .returning();

  if (!updated) {
    return c.json({ error: "NotFound", message: "Member not found" }, 404);
  }

  return c.json(updated);
};
