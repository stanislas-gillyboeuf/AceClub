import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { me, searchUsers, getPreferences } from "./queries";
import { completeOnboarding, updateProfile, createGhost } from "./mutations";
import {
  completeOnboardingValidator,
  createGhostValidator,
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
  zValidator("json", completeOnboardingValidator, (result, c) => {
    if (!result.success) {
      console.log("[complete-onboarding] Validation error:", JSON.stringify(result.error.issues, null, 2));
      console.log("[complete-onboarding] Received body:", JSON.stringify(result.data));
      return c.json({ error: "ValidationError", issues: result.error.issues }, 400);
    }
  }),
  completeOnboarding,
);
userRouter.put("/profile", zValidator("json", updateProfileValidator), updateProfile);
userRouter.post("/ghost", zValidator("json", createGhostValidator), createGhost);
