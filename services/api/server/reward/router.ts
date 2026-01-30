import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getMyBadges, getAllBadges, getMyTitles } from "./queries";
import { equipTitle } from "./mutations";

export const rewardRouter = new Hono<HonoContext>();

rewardRouter.use("/*", requireAuth);

rewardRouter.get("/badges", getMyBadges);
rewardRouter.get("/badges/all", getAllBadges);
rewardRouter.get("/titles", getMyTitles);
rewardRouter.put("/titles/equip", equipTitle);
