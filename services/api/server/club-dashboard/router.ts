import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getDashboardSummary } from "./queries";
import { getDashboardSummaryValidator } from "./validators";

export const clubDashboardRouter = new Hono<HonoContext>();

clubDashboardRouter.use("/*", requireAuth);

clubDashboardRouter.get(
  "/summary",
  zValidator("query", getDashboardSummaryValidator),
  getDashboardSummary,
);
