import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getMyLevel, getUserLevel, getXpHistory } from "./queries";

export const levelRouter = new Hono<HonoContext>();

levelRouter.use("/*", requireAuth);

levelRouter.get("/me", getMyLevel);
levelRouter.get("/user/:userId", getUserLevel);
levelRouter.get("/history", getXpHistory);
