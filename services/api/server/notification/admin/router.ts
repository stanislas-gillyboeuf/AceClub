import { Hono } from "hono";
import type { HonoContext } from "../../../types/hono";
import { requireAuth } from "../../../middleware/auth";
import { isAdmin } from "../../../middleware/admin";
import { zValidator } from "@hono/zod-validator";
import { listTemplates, getTemplate, listSchedules } from "./queries";
import {
  upsertTemplate,
  createVariant,
  updateVariant,
  deleteVariant,
  sendTest,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "./mutations";
import {
  upsertTemplateValidator,
  createVariantValidator,
  updateVariantValidator,
  sendTestValidator,
  createScheduleValidator,
  updateScheduleValidator,
  templateTypeParamValidator,
} from "./validators";

export const notificationAdminRouter = new Hono<HonoContext>();

notificationAdminRouter.use("/*", requireAuth);
notificationAdminRouter.use("/*", isAdmin);

// Templates
notificationAdminRouter.get("/templates", listTemplates);
notificationAdminRouter.get(
  "/templates/:type",
  zValidator("param", templateTypeParamValidator),
  getTemplate,
);
notificationAdminRouter.post(
  "/templates",
  zValidator("json", upsertTemplateValidator),
  upsertTemplate,
);

// Variants
notificationAdminRouter.post(
  "/variants",
  zValidator("json", createVariantValidator),
  createVariant,
);
notificationAdminRouter.put(
  "/variants/:id",
  zValidator("json", updateVariantValidator),
  updateVariant,
);
notificationAdminRouter.delete("/variants/:id", deleteVariant);

// Send test to current admin
notificationAdminRouter.post("/send-test", zValidator("json", sendTestValidator), sendTest);

// Schedules
notificationAdminRouter.get("/schedules", listSchedules);
notificationAdminRouter.post(
  "/schedules",
  zValidator("json", createScheduleValidator),
  createSchedule,
);
notificationAdminRouter.put(
  "/schedules/:id",
  zValidator("json", updateScheduleValidator),
  updateSchedule,
);
notificationAdminRouter.delete("/schedules/:id", deleteSchedule);
