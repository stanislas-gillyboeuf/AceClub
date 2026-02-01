import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getGlobalLeaderboard, getOrganizationLeaderboard, getWeeklyLeaderboard } from "./queries";

export const leaderboardRouter = new Hono<HonoContext>();

leaderboardRouter.use("/*", requireAuth);

leaderboardRouter.get("/global", getGlobalLeaderboard);
leaderboardRouter.get("/organization/:orgId", getOrganizationLeaderboard);
leaderboardRouter.get("/weekly", getWeeklyLeaderboard);
