export interface AttemptLimiterOptions {
  max: number;
  windowMs: number;
  now?: () => number;
}

export interface AttemptResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window attempt counter (in memory, per process — enough to make brute-forcing a short PIN
 * impractical; it resets on restart). The clock is injectable so it can be tested without timers.
 */
export function createAttemptLimiter({ max, windowMs, now = Date.now }: AttemptLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  return {
    /** Count one attempt for `key`; `allowed` is false once the window's budget is spent. */
    hit(key: string): AttemptResult {
      const current = now();
      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= current) {
        bucket = { count: 0, resetAt: current + windowMs };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - current) / 1000));
      return { allowed: bucket.count <= max, retryAfterSeconds };
    },
    /** Forget the attempts of `key` (e.g. after a correct PIN). */
    reset(key: string): void {
      buckets.delete(key);
    },
    /** Drop expired buckets so the map cannot grow without bound. */
    prune(): void {
      const current = now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= current) buckets.delete(key);
      }
    },
  };
}

export type AttemptLimiter = ReturnType<typeof createAttemptLimiter>;
