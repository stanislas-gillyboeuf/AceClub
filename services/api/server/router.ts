import { Hono } from "hono";
import { userRouter } from "./user/router";
import { adminRouter } from "./admin/router";
import { organizationRouter } from "./organization/router";
import { matchRouter } from "./match/router";

export const serverRouter = new Hono();

serverRouter.route("/user", userRouter);
serverRouter.route("/admin", adminRouter);
serverRouter.route("/organization", organizationRouter);
serverRouter.route("/match", matchRouter);