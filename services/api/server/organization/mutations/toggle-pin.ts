import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { togglePinValidator } from "../validators";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { and, eq, inArray } from "drizzle-orm";

export const togglePin = async (c: Context<HonoContext>) => {
  try {
    const authUser = c.get("user");
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof togglePinValidator>;

    const isPlatformAdmin = authUser!.role === "admin";

    if (!isPlatformAdmin) {
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, validated.organizationId),
            eq(member.userId, authUser!.id),
            inArray(member.role, ["admin", "owner"]),
          ),
        )
        .limit(1);

      if (!membership) {
        return c.json(
          { error: "Forbidden", message: "You must be an admin or owner of this organization" },
          403,
        );
      }
    }

    await db
      .update(organization)
      .set({ pinEnabled: validated.enabled })
      .where(eq(organization.id, validated.organizationId));

    return c.json({ success: true, pinEnabled: validated.enabled });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
