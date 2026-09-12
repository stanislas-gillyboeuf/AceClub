import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { previewSegment, listBroadcasts } from "./queries";
import { sendBroadcast } from "./mutations";
import { previewSegmentValidator, listBroadcastsValidator, sendBroadcastValidator } from "./validators";

export const messagingRouter = new Hono<HonoContext>();

messagingRouter.use("/*", requireAuth);

messagingRouter.get("/list", zValidator("query", listBroadcastsValidator), listBroadcasts);
messagingRouter.get(
  "/preview-segment",
  zValidator("query", previewSegmentValidator),
  previewSegment,
);
messagingRouter.post("/send", zValidator("json", sendBroadcastValidator), sendBroadcast);
