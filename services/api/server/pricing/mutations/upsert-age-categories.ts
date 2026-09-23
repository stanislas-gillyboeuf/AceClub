import { Context } from "hono";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifAgeCategory } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { upsertAgeCategoriesValidator } from "../validators";

// A TRUE upsert (update rows in place, insert new ones, delete removed ones) rather than a
// blanket delete-then-insert: tarifBaseRate/tarifLessonRate reference tarifAgeCategory.id with
// ON DELETE CASCADE, so recreating every category on every save would silently wipe the base
// rates and lesson rates of every UNCHANGED category too.
export const upsertAgeCategories = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof upsertAgeCategoriesValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);

  // The client's item ids reference rows as they existed before this call — if the grid was just
  // cloned, translate them to the freshly-cloned ids first.
  const resolvedItems = validated.items.map((item) => ({
    ...item,
    resolvedId: item.id ? idMaps.ageCategory.get(item.id) ?? item.id : undefined,
  }));

  const categories = await db.transaction(async (tx) => {
    const currentRows = await tx
      .select({ id: tarifAgeCategory.id })
      .from(tarifAgeCategory)
      .where(eq(tarifAgeCategory.tarifGridId, gridId));
    const currentIds = new Set(currentRows.map((r) => r.id));

    const keptIds = new Set(resolvedItems.map((item) => item.resolvedId).filter((id): id is string => !!id));
    const idsToDelete = [...currentIds].filter((id) => !keptIds.has(id));
    if (idsToDelete.length > 0) {
      await tx.delete(tarifAgeCategory).where(inArray(tarifAgeCategory.id, idsToDelete));
    }

    for (const item of resolvedItems) {
      if (item.resolvedId && currentIds.has(item.resolvedId)) {
        await tx
          .update(tarifAgeCategory)
          .set({ name: item.name, minAge: item.minAge, maxAge: item.maxAge, sortOrder: item.sortOrder })
          .where(eq(tarifAgeCategory.id, item.resolvedId));
      } else {
        await tx.insert(tarifAgeCategory).values({
          id: ulid(),
          tarifGridId: gridId,
          name: item.name,
          minAge: item.minAge,
          maxAge: item.maxAge,
          sortOrder: item.sortOrder,
        });
      }
    }

    return tx.select().from(tarifAgeCategory).where(eq(tarifAgeCategory.tarifGridId, gridId));
  });

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: "Catégories d'âge modifiées",
  });

  return c.json({ gridId, categories });
};
