import { Hono } from "hono";
import { userRouter } from "./user/router";
import { adminRouter } from "./admin/router";

export const serverRouter = new Hono();

serverRouter.route("/user", userRouter);
serverRouter.route("/admin", adminRouter);
