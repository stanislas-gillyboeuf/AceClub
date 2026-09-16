import { Context } from "hono";
import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubLevelCategory } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { getBuiltinLevels } from "../lib/builtin-levels";
import { listCategoriesValidator } from "../validators";

export const listCategories = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listCategoriesValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const custom = await db
    .select({
      id: clubLevelCategory.id,
      name: clubLevelCategory.name,
      sortOrder: clubLevelCategory.sortOrder,
    })
    .from(clubLevelCategory)
    .where(
      and(
        eq(clubLevelCategory.organizationId, validated.organizationId),
        eq(clubLevelCategory.sport, validated.sport),
      ),
    )
    .orderBy(asc(clubLevelCategory.sortOrder), asc(clubLevelCategory.name));

  return c.json({ builtin: getBuiltinLevels(validated.sport), custom });
};
