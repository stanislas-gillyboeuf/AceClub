import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { HonoContext } from "../../types/hono";
import { me } from "./queries";

export const userRouter = new Hono<HonoContext>();

// Protected route - requires Bearer token authentication
userRouter.use("/*", requireAuth);

userRouter.get("/me", me);
