import { Context } from "hono";

import { HonoContext } from "../../../types/hono";
import { updateOrganizationValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";
import { geocodeAddress } from "../services/geocoding";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const updateOrganization = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateOrganizationValidator>;

  const data = await auth.api.updateOrganization({
    body: {
      data: validated.data,
      organizationId: validated.organizationId,
    },
    headers: c.req.raw.headers,
  });

  // Geocode address if it changed
  if (validated.data.address !== undefined) {
    const coords = validated.data.address ? await geocodeAddress(validated.data.address) : null;
    await db
      .update(organization)
      .set({
        address: validated.data.address || null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      })
      .where(eq(organization.id, validated.organizationId));
  }

  return c.json(data);
};
