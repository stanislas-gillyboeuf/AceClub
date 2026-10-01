import { createAttemptLimiter } from "../../../lib/attempt-limiter";

// Separate from checkClubPin/pin.ts (used by POST /organization/verify-pin, the club-admin
// dashboard's own PIN check — a different security context). 5 attempts/minute, both by account
// AND by IP, so neither a single compromised account nor a single attacker IP can brute-force a
// club code past the other dimension's limit.
const JOIN_ATTEMPTS = 5;
const JOIN_WINDOW_MS = 60 * 1000;

const accountLimiter = createAttemptLimiter({ max: JOIN_ATTEMPTS, windowMs: JOIN_WINDOW_MS });
const ipLimiter = createAttemptLimiter({ max: JOIN_ATTEMPTS, windowMs: JOIN_WINDOW_MS });

export function joinClientIp(forwardedFor: string | undefined, realIp: string | undefined): string | null {
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null;
}

export type JoinRateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Every join attempt counts, whether or not a PIN was required — a correct join resets both. */
export function checkJoinRateLimit(userId: string, organizationId: string, ip: string | null): JoinRateLimitResult {
  const accountKey = `${userId}:${organizationId}`;
  const accountAttempt = accountLimiter.hit(accountKey);
  const ipAttempt = ip ? ipLimiter.hit(`ip:${ip}`) : { allowed: true, retryAfterSeconds: 0 };

  if (!accountAttempt.allowed || !ipAttempt.allowed) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(accountAttempt.retryAfterSeconds, ipAttempt.retryAfterSeconds),
    };
  }
  return { allowed: true };
}

export function resetJoinRateLimit(userId: string, organizationId: string, ip: string | null): void {
  accountLimiter.reset(`${userId}:${organizationId}`);
  if (ip) ipLimiter.reset(`ip:${ip}`);
}
