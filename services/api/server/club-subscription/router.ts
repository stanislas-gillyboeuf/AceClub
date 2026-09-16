import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listTypes, getMemberSubscription } from "./queries";
import { createType, assign } from "./mutations";
import {
  listTypesValidator,
  getMemberSubscriptionValidator,
  createTypeValidator,
  assignSubscriptionValidator,
} from "./validators";

export const clubSubscriptionRouter = new Hono<HonoContext>();

clubSubscriptionRouter.use("/*", requireAuth);

clubSubscriptionRouter.get("/types", zValidator("query", listTypesValidator), listTypes);
clubSubscriptionRouter.get(
  "/member-subscription",
  zValidator("query", getMemberSubscriptionValidator),
  getMemberSubscription,
);
clubSubscriptionRouter.post("/types/create", zValidator("json", createTypeValidator), createType);
clubSubscriptionRouter.post("/assign", zValidator("json", assignSubscriptionValidator), assign);
