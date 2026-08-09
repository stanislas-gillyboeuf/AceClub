import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema/court/schema";
import { z } from "zod";
import { createCourtValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const createCourt = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createCourtValidator>;

  const isAdmin = await assertOrgAdmin(currentUser.id, body.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Only club admins can add courts" }, 403);
  }

  const [created] = await db
    .insert(court)
    .values({
      organizationId: body.organizationId,
      name: body.name,
      surface: body.surface,
      location: body.location,
      pricePerHour: body.pricePerHour,
    })
    .returning();

  return c.json({ data: created }, 201);
};
