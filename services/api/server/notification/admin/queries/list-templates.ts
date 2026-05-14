import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../../../db/schema/notification/schema";
import { eq, sql } from "drizzle-orm";

export const listTemplates = async (c: Context<HonoContext>) => {
  const templates = await db
    .select({
      id: notificationTemplate.id,
      type: notificationTemplate.type,
      description: notificationTemplate.description,
      availableVariables: notificationTemplate.availableVariables,
      isActive: notificationTemplate.isActive,
      createdAt: notificationTemplate.createdAt,
      updatedAt: notificationTemplate.updatedAt,
      variantsCount: sql<number>`count(${notificationTemplateVariant.id})::int`.as(
        "variants_count",
      ),
      activeVariantsCount: sql<number>`
        count(${notificationTemplateVariant.id}) FILTER (
          WHERE ${notificationTemplateVariant.isActive} = true
        )::int
      `.as("active_variants_count"),
    })
    .from(notificationTemplate)
    .leftJoin(
      notificationTemplateVariant,
      eq(notificationTemplate.id, notificationTemplateVariant.templateId),
    )
    .groupBy(notificationTemplate.id)
    .orderBy(notificationTemplate.type);

  return c.json({ templates });
};
