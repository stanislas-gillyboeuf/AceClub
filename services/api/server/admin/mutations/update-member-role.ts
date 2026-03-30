import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateMemberRoleAdminValidator } from "../validators";
import { db } from "../../../db";
import { member } from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";

export const updateMemberRole = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateMemberRoleAdminValidator>;

    const [existing] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.id, validated.memberId),
          eq(member.organizationId, validated.organizationId),
        ),
      )
      .limit(1);

    if (!existing) {
      return c.json({ error: "NotFound", message: "Member not found" }, 404);
    }

    const [updated] = await db
      .update(member)
      .set({ role: validated.role })
      .where(eq(member.id, validated.memberId))
      .returning();

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "InternalError", message: (error as Error).message }, 500);
  }
};
