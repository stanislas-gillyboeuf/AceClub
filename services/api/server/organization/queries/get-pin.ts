import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { getPinValidator } from "../validators";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { and, eq, inArray } from "drizzle-orm";

export const getPin = async (c: Context<HonoContext>) => {
  try {
    const authUser = c.get("user");
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof getPinValidator>;

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

    const [org] = await db
      .select({ pin: organization.pin, pinEnabled: organization.pinEnabled })
      .from(organization)
      .where(eq(organization.id, validated.organizationId))
      .limit(1);

    if (!org) {
      return c.json({ error: "Not found", message: "Organization not found" }, 404);
    }

    return c.json({ pin: org.pin, pinEnabled: org.pinEnabled });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
