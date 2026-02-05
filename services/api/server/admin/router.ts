import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { isAdmin } from "../../middleware/admin";
import { listUsers, listUserSessions, userStats } from "./queries";
import { zValidator } from "@hono/zod-validator";
import {
  banUserValidator,
  createUserValidator,
  listUserSessionsValidator,
  listUsersValidator,
  setRoleValidator,
  updateUserValidator,
  setUserPasswordValidator,
  unbanUserValidator,
  revokeUserSessionsValidator,
  revokeUserSessionValidator,
} from "./validators";
import {
  banUser,
  createUser,
  revokeUserSession,
  revokeUserSessions,
  setRole,
  setUserPassword,
  unbanUser,
  updateUser,
} from "./mutations";

export const adminRouter = new Hono<HonoContext>();

// requireAuth MUST come before isAdmin to inject user into context
adminRouter.use("/*", requireAuth);
adminRouter.use("/*", isAdmin);

adminRouter.get("/list-users", zValidator("query", listUsersValidator), listUsers);

adminRouter.get(
  "/list-user-sessions",
  zValidator("query", listUserSessionsValidator),
  listUserSessions,
);

adminRouter.get("/user-stats/:userId", userStats);

adminRouter.put("/update-user", zValidator("json", updateUserValidator), updateUser);

adminRouter.post("/set-role", zValidator("json", setRoleValidator), setRole);

adminRouter.put(
  "/set-user-password",
  zValidator("json", setUserPasswordValidator),
  setUserPassword,
);

adminRouter.post("/create-user", zValidator("json", createUserValidator), createUser);

adminRouter.post("/ban-user", zValidator("json", banUserValidator), banUser);

adminRouter.post("/unban-user", zValidator("json", unbanUserValidator), unbanUser);

adminRouter.post(
  "/revoke-user-session",
  zValidator("json", revokeUserSessionValidator),
  revokeUserSession,
);

adminRouter.post(
  "/revoke-user-sessions",
  zValidator("json", revokeUserSessionsValidator),
  revokeUserSessions,
);
