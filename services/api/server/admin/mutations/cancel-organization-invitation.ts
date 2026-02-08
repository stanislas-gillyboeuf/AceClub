import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { invitation } from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";
import { cancelOrganizationInvitationAdminValidator } from "../validators";
import { z } from "zod";

export const cancelOrganizationInvitation = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<
    typeof cancelOrganizationInvitationAdminValidator
  >;

  const [existing] = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.id, validated.invitationId), eq(invitation.status, "pending")))
    .limit(1);

  if (!existing) {
    return c.json(
      {
        error: "NotFound",
        message: "Pending invitation not found",
      },
      404,
    );
  }

  const [updated] = await db
    .update(invitation)
    .set({ status: "canceled" })
    .where(eq(invitation.id, validated.invitationId))
    .returning();

  return c.json(updated);
};
