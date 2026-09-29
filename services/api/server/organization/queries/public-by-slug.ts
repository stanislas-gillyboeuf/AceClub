import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { publicBySlugValidator } from "../validators";

/**
 * Public, unauthenticated lookup for the /adherent/[slug] member page. Returns only the
 * fields a public landing page needs — never address, PIN, metadata, or anything else on
 * `organization`. A club that exists but isn't marked `isClient` is indistinguishable from
 * one that doesn't exist at all: both are 404, so this never reveals which clubs are
 * commercial clients.
 */
export const publicBySlug = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof publicBySlugValidator>;

  const [org] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      isClient: organization.isClient,
    })
    .from(organization)
    .where(eq(organization.slug, validated.slug))
    .limit(1);

  if (!org || !org.isClient) {
    return c.json({ error: "NotFound", message: "Not found" }, 404);
  }

  return c.json({ id: org.id, name: org.name, slug: org.slug, logo: org.logo });
};
