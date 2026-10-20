import { createAttemptLimiter } from "../../../lib/attempt-limiter";

// Public, unauthenticated endpoints (booking creation, no-slot contact) — limited by IP only,
// same fixed-window pattern as server/organization/lib/join-rate-limit.ts.
const WRITE_ATTEMPTS = 5;
const WRITE_WINDOW_MS = 60 * 1000;

const writeLimiter = createAttemptLimiter({ max: WRITE_ATTEMPTS, windowMs: WRITE_WINDOW_MS });

export function demoBookingClientIp(
  forwardedFor: string | undefined,
  realIp: string | undefined,
): string | null {
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null;
}

export type DemoBookingRateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkDemoBookingWriteRateLimit(ip: string | null): DemoBookingRateLimitResult {
  if (!ip) return { allowed: true };
  const result = writeLimiter.hit(ip);
  return result.allowed ? { allowed: true } : { allowed: false, retryAfterSeconds: result.retryAfterSeconds };
}
