import { Context, Next } from "hono";
import { auth } from "../auth";
import type { HonoContext } from "../types/hono";

/**
 * Auth middleware that extracts user/session from Bearer token or cookies.
 * Sets user and session in context (can be null if not authenticated).
 * Use this for routes where auth is optional.
 */
export const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};

/**
 * Middleware that requires authentication.
 * Returns 401 if no valid Bearer token or session is found.
 * Use this for protected routes.
 */
export const requireAuth = async (c: Context<HonoContext>, next: Next) => {
  console.log("requireAuth middleware called");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log("session", session);

  if (!session) {
    return c.json({ error: "Unauthorized", message: "Valid authentication required" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
