import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import { zValidator } from "@hono/zod-validator";
import { createAccountDeletionRequestValidator } from "./validators";
import { createAccountDeletionRequest } from "./mutations";
import { listAccountDeletionRequests } from "./queries";

export const accountDeletionRequestRouter = new Hono<HonoContext>();

// POST / — public route (no auth required)
accountDeletionRequestRouter.post(
  "/",
  zValidator("json", createAccountDeletionRequestValidator),
  createAccountDeletionRequest,
);

// GET /list — admin only
accountDeletionRequestRouter.get("/list", requireAuth, isAdmin, listAccountDeletionRequests);
