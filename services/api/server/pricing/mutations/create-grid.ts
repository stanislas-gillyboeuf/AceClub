import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifRule,
} from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { cloneGridChildren } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import {
  getStarterTemplateAgeCategories,
  getStarterTemplateBaseRates,
  getStarterTemplateLessonRates,
  buildStarterTemplateRules,
} from "../lib/starter-template";
import { createGridValidator } from "../validators";

export const createGrid = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createGridValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (validated.mode === "duplicate") {
    const [source] = await db
      .select()
      .from(tarifGrid)
      .where(eq(tarifGrid.id, validated.duplicateFromGridId!))
      .limit(1);
    if (!source || source.organizationId !== validated.organizationId) {
      return c.json({ error: "NotFound", message: "Source grid not found" }, 404);
    }
  }

  const grid = await db.transaction(async (tx) => {
    const newGridId = ulid();
    const familyId = ulid();

    const [created] = await tx
      .insert(tarifGrid)
      .values({
        id: newGridId,
        organizationId: validated.organizationId,
        familyId,
        version: 1,
        seasonLabel: validated.seasonLabel,
        seasonStartDate: new Date(validated.seasonStartDate),
        seasonEndDate: new Date(validated.seasonEndDate),
        status: "draft",
        createdByUserId: currentUser.id,
      })
      .returning();

    if (validated.mode === "duplicate") {
      await cloneGridChildren(tx, validated.duplicateFromGridId!, newGridId);
    } else if (validated.mode === "template") {
      const categoryIdByName: Record<string, string> = {};
      for (const category of getStarterTemplateAgeCategories()) {
        const categoryId = ulid();
        categoryIdByName[category.name] = categoryId;
        await tx.insert(tarifAgeCategory).values({
          id: categoryId,
          tarifGridId: newGridId,
          name: category.name,
          minAge: category.minAge,
          maxAge: category.maxAge,
          sortOrder: category.sortOrder,
        });
      }

      for (const rate of getStarterTemplateBaseRates()) {
        await tx.insert(tarifBaseRate).values({
          id: ulid(),
          tarifGridId: newGridId,
          categoryId: categoryIdByName[rate.categoryName],
          membershipFeeCents: rate.membershipFeeCents,
          licenseFeeCents: rate.licenseFeeCents,
        });
      }

      for (const rate of getStarterTemplateLessonRates()) {
        await tx.insert(tarifLessonRate).values({
          id: ulid(),
          tarifGridId: newGridId,
          categoryId: categoryIdByName[rate.categoryName],
          lessonsPerWeek: rate.lessonsPerWeek,
          priceCents: rate.priceCents,
        });
      }

      for (const rule of buildStarterTemplateRules(categoryIdByName)) {
        await tx.insert(tarifRule).values({
          id: ulid(),
          tarifGridId: newGridId,
          name: rule.name,
          conditions: rule.conditions,
          effectType: rule.effectType,
          effectValue: rule.effectValue,
          targetType: rule.targetType,
          exclusivityGroup: rule.exclusivityGroup ?? null,
        });
      }
    }

    return created;
  });

  await logGridAudit({
    tarifGridId: grid.id,
    organizationId: grid.organizationId,
    actorUserId: currentUser.id,
    action: "created",
    summary: `Grille créée (mode : ${validated.mode})`,
  });

  return c.json({ grid }, 201);
};
