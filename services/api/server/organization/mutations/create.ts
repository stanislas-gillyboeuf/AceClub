import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createOrganizationValidator } from "../validators";
import { auth } from "../../../auth";

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

    return c.json(createdOrganization);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
