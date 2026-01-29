import { Hono } from "hono";
import { userRouter } from "./user/router";
import { adminRouter } from "./admin/router";
import { organizationRouter } from "./organization/router";
import { matchRouter } from "./match/router";
import { matchIntentRouter } from "./match_intents/router";
import { notificationRouter } from "./notification/router";

export const serverRouter = new Hono();

serverRouter.route("/user", userRouter);
serverRouter.route("/admin", adminRouter);
serverRouter.route("/organization", organizationRouter);
serverRouter.route("/match", matchRouter);
serverRouter.route("/match-intents", matchIntentRouter);
serverRouter.route("/notification", notificationRouter);
