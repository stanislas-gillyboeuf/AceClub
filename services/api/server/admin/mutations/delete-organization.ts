import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { deleteOrganizationAdminValidator } from "../validators";
import { z } from "zod";

export const deleteOrganization = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<
    typeof deleteOrganizationAdminValidator
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

  await db
    .delete(organization)
    .where(eq(organization.id, validated.organizationId));

  return c.json({ success: true });
};
