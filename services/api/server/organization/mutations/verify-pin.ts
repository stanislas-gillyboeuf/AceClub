import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { verifyPinValidator } from "../validators";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { checkClubPin, tooManyAttempts } from "../lib/pin";

export const verifyPin = async (c: Context<HonoContext>) => {
  try {
    const authUser = c.get("user")!;
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
      return c.json(
        { error: "BadRequest", message: "PIN is not enabled for this organization" },
        400,
      );
    }

    const check = checkClubPin(authUser.id, validated.organizationId, validated.pin, org.pin);
    if (check.status === "limited") {
      c.header("Retry-After", String(check.retryAfterSeconds));
      return c.json(tooManyAttempts(check.retryAfterSeconds), 429);
    }

    return c.json({ valid: check.status === "ok" });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
