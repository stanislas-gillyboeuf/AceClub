import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { getMyChallenges, getChallengeTemplates } from "./queries";

export const challengeRouter = new Hono<HonoContext>();

challengeRouter.use("/*", requireAuth);

challengeRouter.get("/", getMyChallenges);
challengeRouter.get("/templates", getChallengeTemplates);
