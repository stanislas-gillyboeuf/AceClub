import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import { db } from "../../../db";
import { accountDeletionRequest } from "../../../db/schema/account-deletion-request/schema";
import { createAccountDeletionRequestValidator } from "../validators";
import { createAttemptLimiter } from "../../../lib/attempt-limiter";

// Public endpoint: 5 requests per hour per IP (per email when no IP header is available).
const requestLimiter = createAttemptLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

export function clientKey(forwardedFor: string | undefined, realIp: string | undefined, email: string): string {
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim();
  return ip ? `ip:${ip}` : `email:${email.toLowerCase()}`;
}

export const createAccountDeletionRequest = async (c: Context) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createAccountDeletionRequestValidator>;

    const key = clientKey(c.req.header("x-forwarded-for"), c.req.header("x-real-ip"), validated.email);
    const attempt = requestLimiter.hit(key);
    if (!attempt.allowed) {
      c.header("Retry-After", String(attempt.retryAfterSeconds));
      return c.json({ error: "TooManyRequests", message: "Too many requests, try again later" }, 429);
    }

    await db.insert(accountDeletionRequest).values({
      id: ulid(),
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
      clubName: validated.clubName,
      reason: validated.reason,
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};
