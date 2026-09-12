import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { completeOnboardingValidator } from "../validators";

export const completeOnboarding = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof completeOnboardingValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  await db
    .update(organization)
    .set({ onboardingCompleted: true })
    .where(eq(organization.id, validated.organizationId));

  return c.json({ success: true });
};
