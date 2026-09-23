import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listGrids, getGrid, getActiveGrid, listAuditLog } from "./queries";
import {
  createGrid,
  updateGridSettings,
  activateGrid,
  upsertAgeCategories,
  upsertBaseRates,
  upsertLessonRates,
  createAdditionalLine,
  updateAdditionalLine,
  deleteAdditionalLine,
  createRule,
  updateRule,
  deleteRule,
  reorderRules,
  duplicateRule,
  toggleRule,
  simulate,
} from "./mutations";
import {
  listGridsValidator,
  getGridValidator,
  getActiveGridValidator,
  listAuditLogValidator,
  createGridValidator,
  updateGridSettingsValidator,
  activateGridValidator,
  upsertAgeCategoriesValidator,
  upsertBaseRatesValidator,
  upsertLessonRatesValidator,
  createAdditionalLineValidator,
  updateAdditionalLineValidator,
  deleteAdditionalLineValidator,
  createRuleValidator,
  updateRuleValidator,
  deleteRuleValidator,
  reorderRulesValidator,
  duplicateRuleValidator,
  toggleRuleValidator,
  simulateValidator,
} from "./validators";

export const pricingRouter = new Hono<HonoContext>();

pricingRouter.use("/*", requireAuth);

// --- Queries (all full-admin only, enforced in each handler) ---
// NOTE: this repo never uses Hono path params (":id") anywhere else — every domain (dues,
// club-level, tournament...) passes ids via query params (GET) or JSON body (POST). We follow
// that convention here too rather than the literal "/tarif-grids/:id/simulate" from the client
// prompt, for consistency with the rest of the codebase.
pricingRouter.get("/grids", zValidator("query", listGridsValidator), listGrids);
pricingRouter.get("/grids/active", zValidator("query", getActiveGridValidator), getActiveGrid);
pricingRouter.get("/grids/get", zValidator("query", getGridValidator), getGrid);
pricingRouter.get("/grids/audit-log", zValidator("query", listAuditLogValidator), listAuditLog);

// --- Mutations ---
pricingRouter.post("/grids/create", zValidator("json", createGridValidator), createGrid);
pricingRouter.post(
  "/grids/update-settings",
  zValidator("json", updateGridSettingsValidator),
  updateGridSettings,
);
pricingRouter.post("/grids/activate", zValidator("json", activateGridValidator), activateGrid);
pricingRouter.post(
  "/age-categories/upsert",
  zValidator("json", upsertAgeCategoriesValidator),
  upsertAgeCategories,
);
pricingRouter.post("/base-rates/upsert", zValidator("json", upsertBaseRatesValidator), upsertBaseRates);
pricingRouter.post(
  "/lesson-rates/upsert",
  zValidator("json", upsertLessonRatesValidator),
  upsertLessonRates,
);
pricingRouter.post(
  "/additional-lines/create",
  zValidator("json", createAdditionalLineValidator),
  createAdditionalLine,
);
pricingRouter.post(
  "/additional-lines/update",
  zValidator("json", updateAdditionalLineValidator),
  updateAdditionalLine,
);
pricingRouter.post(
  "/additional-lines/delete",
  zValidator("json", deleteAdditionalLineValidator),
  deleteAdditionalLine,
);
pricingRouter.post("/rules/create", zValidator("json", createRuleValidator), createRule);
pricingRouter.post("/rules/update", zValidator("json", updateRuleValidator), updateRule);
pricingRouter.post("/rules/delete", zValidator("json", deleteRuleValidator), deleteRule);
pricingRouter.post("/rules/reorder", zValidator("json", reorderRulesValidator), reorderRules);
pricingRouter.post("/rules/duplicate", zValidator("json", duplicateRuleValidator), duplicateRule);
pricingRouter.post("/rules/toggle", zValidator("json", toggleRuleValidator), toggleRule);
pricingRouter.post("/grids/simulate", zValidator("json", simulateValidator), simulate);
