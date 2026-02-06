import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { updateOrganizationAdminValidator } from "../validators";
import { z } from "zod";

export const updateOrganization = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<
    typeof updateOrganizationAdminValidator
  >;

  const [existing] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!existing) {
    return c.json(
      { error: "NotFound", message: "Organization not found" },
      404,
    );
  }

  const updateData: Record<string, unknown> = {};
  if (validated.data.name !== undefined) updateData.name = validated.data.name;
  if (validated.data.slug !== undefined) updateData.slug = validated.data.slug;
  if (validated.data.logo !== undefined) updateData.logo = validated.data.logo;
  if (validated.data.metadata !== undefined)
    updateData.metadata = JSON.stringify(validated.data.metadata);

  const [updated] = await db
    .update(organization)
    .set(updateData)
    .where(eq(organization.id, validated.organizationId))
    .returning();

  return c.json(updated);
};
