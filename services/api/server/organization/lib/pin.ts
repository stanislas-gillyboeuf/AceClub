import { createAttemptLimiter } from "../../../lib/attempt-limiter";
import { safeEqual } from "./access-rules";

const PIN_ATTEMPTS = 5;
const PIN_WINDOW_MS = 10 * 60 * 1000;

const pinLimiter = createAttemptLimiter({ max: PIN_ATTEMPTS, windowMs: PIN_WINDOW_MS });

export type PinCheck =
  | { status: "ok" }
  | { status: "invalid" }
  | { status: "limited"; retryAfterSeconds: number };

/** Every check counts as an attempt for (user, club); a correct PIN clears the counter. */
export function checkClubPin(userId: string, organizationId: string, supplied: string, actual: string): PinCheck {
  const key = `${userId}:${organizationId}`;
  const attempt = pinLimiter.hit(key);
  if (!attempt.allowed) return { status: "limited", retryAfterSeconds: attempt.retryAfterSeconds };
  if (!safeEqual(supplied, actual)) return { status: "invalid" };
  pinLimiter.reset(key);
  return { status: "ok" };
}

export const tooManyAttempts = (retryAfterSeconds: number) => ({
  error: "TooManyRequests",
  message: `Too many PIN attempts, retry in ${retryAfterSeconds}s`,
});
