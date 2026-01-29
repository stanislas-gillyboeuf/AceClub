import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { me, searchUsers, getPreferences } from "./queries";
import { completeOnboarding, updateProfile } from "./mutations";
import {
  completeOnboardingValidator,
  searchUsersValidator,
  updateProfileValidator,
} from "./validators";

export const userRouter = new Hono<HonoContext>();

// Protected route - requires Bearer token authentication
userRouter.use("/*", requireAuth);

userRouter.get("/me", me);
userRouter.get("/preferences", getPreferences);
userRouter.get("/search", zValidator("query", searchUsersValidator), searchUsers);
userRouter.post(
  "/complete-onboarding",
  zValidator("json", completeOnboardingValidator),
  completeOnboarding,
);
userRouter.put("/profile", zValidator("json", updateProfileValidator), updateProfile);
