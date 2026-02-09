import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { verifyPinValidator } from "../validators";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const verifyPin = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof verifyPinValidator>;

    const [org] = await db
      .select({ pin: organization.pin, pinEnabled: organization.pinEnabled })
      .from(organization)
      .where(eq(organization.id, validated.organizationId))
      .limit(1);

    if (!org) {
      return c.json({ error: "NotFound", message: "Organization not found" }, 404);
    }

    if (!org.pinEnabled || !org.pin) {
      return c.json({ error: "BadRequest", message: "PIN is not enabled for this organization" }, 400);
    }

    if (validated.pin !== org.pin) {
      return c.json({ valid: false });
    }

    return c.json({ valid: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
