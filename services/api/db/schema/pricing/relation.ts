import { relations } from "drizzle-orm";
import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifAdditionalLine,
  tarifRule,
  tarifGridAuditLog,
} from "./schema";
import { organization, user } from "../auth/schema";

export const tarifGridRelations = relations(tarifGrid, ({ one, many }) => ({
  organization: one(organization, {
    fields: [tarifGrid.organizationId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [tarifGrid.createdByUserId],
    references: [user.id],
  }),
  ageCategories: many(tarifAgeCategory),
  baseRates: many(tarifBaseRate),
  lessonRates: many(tarifLessonRate),
  additionalLines: many(tarifAdditionalLine),
  rules: many(tarifRule),
  auditLogs: many(tarifGridAuditLog),
}));

export const tarifAgeCategoryRelations = relations(tarifAgeCategory, ({ one, many }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifAgeCategory.tarifGridId],
    references: [tarifGrid.id],
  }),
  baseRates: many(tarifBaseRate),
  lessonRates: many(tarifLessonRate),
}));

export const tarifBaseRateRelations = relations(tarifBaseRate, ({ one }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifBaseRate.tarifGridId],
    references: [tarifGrid.id],
  }),
  category: one(tarifAgeCategory, {
    fields: [tarifBaseRate.categoryId],
    references: [tarifAgeCategory.id],
  }),
}));

export const tarifLessonRateRelations = relations(tarifLessonRate, ({ one }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifLessonRate.tarifGridId],
    references: [tarifGrid.id],
  }),
  category: one(tarifAgeCategory, {
    fields: [tarifLessonRate.categoryId],
    references: [tarifAgeCategory.id],
  }),
}));

export const tarifAdditionalLineRelations = relations(tarifAdditionalLine, ({ one, many }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifAdditionalLine.tarifGridId],
    references: [tarifGrid.id],
  }),
  targetingRules: many(tarifRule),
}));

export const tarifRuleRelations = relations(tarifRule, ({ one }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifRule.tarifGridId],
    references: [tarifGrid.id],
  }),
  targetAdditionalLine: one(tarifAdditionalLine, {
    fields: [tarifRule.targetAdditionalLineId],
    references: [tarifAdditionalLine.id],
  }),
}));

export const tarifGridAuditLogRelations = relations(tarifGridAuditLog, ({ one }) => ({
  tarifGrid: one(tarifGrid, {
    fields: [tarifGridAuditLog.tarifGridId],
    references: [tarifGrid.id],
  }),
  organization: one(organization, {
    fields: [tarifGridAuditLog.organizationId],
    references: [organization.id],
  }),
  actor: one(user, {
    fields: [tarifGridAuditLog.actorUserId],
    references: [user.id],
  }),
}));
