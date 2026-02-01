import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getMyStreak } from "./queries";

export const streakRouter = new Hono<HonoContext>();

streakRouter.use("/*", requireAuth);

streakRouter.get("/me", getMyStreak);
