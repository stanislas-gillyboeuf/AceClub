import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getHomeBoard } from "./queries";
import { getDashboardSummaryValidator } from "./validators";

export const clubDashboardRouter = new Hono<HonoContext>();

clubDashboardRouter.use("/*", requireAuth);

clubDashboardRouter.get("/home", zValidator("query", getDashboardSummaryValidator), getHomeBoard);
