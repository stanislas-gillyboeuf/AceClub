import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { updateOrganizationAdminValidator } from "../validators";
import { z } from "zod";
import { geocodeAddress } from "../../organization/services/geocoding";

export const updateOrganization = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateOrganizationAdminValidator>;

  const [existing] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (validated.data.name !== undefined) updateData.name = validated.data.name;
  if (validated.data.slug !== undefined) updateData.slug = validated.data.slug;
  if (validated.data.logo !== undefined) updateData.logo = validated.data.logo;
  if (validated.data.metadata !== undefined)
    updateData.metadata = JSON.stringify(validated.data.metadata);

  if (validated.data.address !== undefined) {
    updateData.address = validated.data.address || null;
    const coords = validated.data.address ? await geocodeAddress(validated.data.address) : null;
    updateData.latitude = coords?.latitude ?? null;
    updateData.longitude = coords?.longitude ?? null;
  }

  const [updated] = await db
    .update(organization)
    .set(updateData)
    .where(eq(organization.id, validated.organizationId))
    .returning();

  return c.json(updated);
};
