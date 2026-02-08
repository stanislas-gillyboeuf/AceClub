import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { regeneratePinValidator } from "../validators";
import { generatePin } from "../services/pin";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { and, eq, inArray } from "drizzle-orm";

export const regeneratePin = async (c: Context<HonoContext>) => {
  try {
    const authUser = c.get("user");
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof regeneratePinValidator>;

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

    const newPin = generatePin();
    await db
      .update(organization)
      .set({ pin: newPin })
      .where(eq(organization.id, validated.organizationId));

    const [org] = await db
      .select({ pin: organization.pin, pinEnabled: organization.pinEnabled })
      .from(organization)
      .where(eq(organization.id, validated.organizationId))
      .limit(1);

    return c.json({ pin: org.pin, pinEnabled: org.pinEnabled });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
