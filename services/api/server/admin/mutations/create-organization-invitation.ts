import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  invitation,
  organization,
} from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";
import { createOrganizationInvitationAdminValidator } from "../validators";
import { z } from "zod";
import { ulid } from "ulid";

export const createOrganizationInvitation = async (
  c: Context<HonoContext>,
) => {
  const adminUser = c.get("user")!;

  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<
    typeof createOrganizationInvitationAdminValidator
  >;

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!org) {
    return c.json(
      { error: "NotFound", message: "Organization not found" },
      404,
    );
  }

  const [existingInvitation] = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.email, validated.email),
        eq(invitation.organizationId, validated.organizationId),
        eq(invitation.status, "pending"),
      ),
    )
    .limit(1);

  if (existingInvitation) {
    return c.json(
      {
        error: "Conflict",
        message: "A pending invitation already exists for this email",
      },
      409,
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [created] = await db
    .insert(invitation)
    .values({
      id: ulid(),
      organizationId: validated.organizationId,
      email: validated.email,
      role: validated.role,
      status: "pending",
      expiresAt,
      inviterId: adminUser.id,
    })
    .returning();

  return c.json(created, 201);
};
