import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createOrganizationValidator } from "../validators";
import { auth } from "../../../auth";
import { geocodeAddress } from "../services/geocoding";
import { generatePin } from "../services/pin";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { eq, and } from "drizzle-orm";

export const createOrganization = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createOrganizationValidator>;

    const createdOrganization = await auth.api.createOrganization({
      body: {
        name: validated.name,
        slug: validated.slug,
        logo: validated.logo,
        metadata: validated.metadata,
        userId: validated.userId,
        keepCurrentActiveOrganization: validated.keepCurrentActiveOrganization,
      },
      headers: c.req.raw.headers,
    });

    if (createdOrganization && createdOrganization.id) {
      const updateData: Record<string, unknown> = {
        pin: generatePin(),
      };

      if (validated.address) {
        const coords = await geocodeAddress(validated.address);
        updateData.address = validated.address;
        if (coords) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
        }
      }

      await db
        .update(organization)
        .set(updateData)
        .where(eq(organization.id, createdOrganization.id));

      // Si l'utilisateur est admin plateforme, supprimer le member auto-créé par Better Auth
      const authUser = c.get("user");
      if (authUser?.role === "admin") {
        await db
          .delete(member)
          .where(
            and(
              eq(member.organizationId, createdOrganization.id),
              eq(member.userId, authUser.id)
            )
          );
      }
    }

    return c.json(createdOrganization);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
