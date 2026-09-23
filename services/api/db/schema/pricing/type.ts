import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifAdditionalLine,
  tarifRule,
  tarifGridAuditLog,
  memberCotisation,
  memberCotisationReminderLog,
} from "./schema";

export type TarifGrid = typeof tarifGrid.$inferSelect;
export type NewTarifGrid = typeof tarifGrid.$inferInsert;
export type TarifAgeCategory = typeof tarifAgeCategory.$inferSelect;
export type NewTarifAgeCategory = typeof tarifAgeCategory.$inferInsert;
export type TarifBaseRate = typeof tarifBaseRate.$inferSelect;
export type NewTarifBaseRate = typeof tarifBaseRate.$inferInsert;
export type TarifLessonRate = typeof tarifLessonRate.$inferSelect;
export type NewTarifLessonRate = typeof tarifLessonRate.$inferInsert;
export type TarifAdditionalLine = typeof tarifAdditionalLine.$inferSelect;
export type NewTarifAdditionalLine = typeof tarifAdditionalLine.$inferInsert;
export type TarifRule = typeof tarifRule.$inferSelect;
export type NewTarifRule = typeof tarifRule.$inferInsert;
export type TarifGridAuditLog = typeof tarifGridAuditLog.$inferSelect;
export type NewTarifGridAuditLog = typeof tarifGridAuditLog.$inferInsert;

export type TarifGridStatusType = "draft" | "active" | "archived";
export type TarifAgeReferenceModeType = "season_start" | "dec_31_start_year" | "season_end_year";
export type TarifCumulModeType = "cumulative" | "best_only";
export type TarifRoundingIncrementType = "none" | "fifty_cents" | "one_euro";
export type TarifRuleEffectTypeType =
  | "percent_discount"
  | "fixed_discount"
  | "surcharge_amount"
  | "surcharge_percent"
  | "fixed_price";
export type TarifRuleTargetTypeType =
  | "membership"
  | "lessons"
  | "license"
  | "additional_line"
  | "total_excluding_license";
export type TarifAuditActionType = "created" | "updated" | "activated" | "archived" | "duplicated";

export type MemberCotisation = typeof memberCotisation.$inferSelect;
export type NewMemberCotisation = typeof memberCotisation.$inferInsert;
export type MemberCotisationReminderLog = typeof memberCotisationReminderLog.$inferSelect;
export type NewMemberCotisationReminderLog = typeof memberCotisationReminderLog.$inferInsert;
export type MemberCotisationStatusType = "pending" | "paid" | "waived";
