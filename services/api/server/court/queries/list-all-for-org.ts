import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { court } from "../../../db/schema";
import { listAllForOrgValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const listAllForOrg = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listAllForOrgValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, query.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to manage courts for this organization" },
      403,
    );
  }

  const courts = await db
    .select()
    .from(court)
    .where(eq(court.organizationId, query.organizationId));

  return c.json(courts);
};
