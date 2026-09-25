import { describe, expect, it } from "vitest";
import { createAttemptLimiter } from "../../lib/attempt-limiter";

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe("attempt limiter", () => {
  it("allows up to max attempts per window then blocks", () => {
    const c = clock();
    const limiter = createAttemptLimiter({ max: 3, windowMs: 60_000, now: c.now });
    expect(limiter.hit("u:o").allowed).toBe(true);
    expect(limiter.hit("u:o").allowed).toBe(true);
    expect(limiter.hit("u:o").allowed).toBe(true);
    const blocked = limiter.hit("u:o");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps keys independent", () => {
    const c = clock();
    const limiter = createAttemptLimiter({ max: 1, windowMs: 60_000, now: c.now });
    expect(limiter.hit("a").allowed).toBe(true);
    expect(limiter.hit("a").allowed).toBe(false);
    expect(limiter.hit("b").allowed).toBe(true);
  });

  it("opens a new window after windowMs", () => {
    const c = clock();
    const limiter = createAttemptLimiter({ max: 1, windowMs: 60_000, now: c.now });
    limiter.hit("a");
    expect(limiter.hit("a").allowed).toBe(false);
    c.advance(60_001);
    expect(limiter.hit("a").allowed).toBe(true);
  });

  it("reset forgets the attempts and prune drops expired buckets", () => {
    const c = clock();
    const limiter = createAttemptLimiter({ max: 1, windowMs: 1_000, now: c.now });
    limiter.hit("a");
    expect(limiter.hit("a").allowed).toBe(false);
    limiter.reset("a");
    expect(limiter.hit("a").allowed).toBe(true);
    c.advance(2_000);
    limiter.prune();
    expect(limiter.hit("a").allowed).toBe(true);
  });

  it("reports a retry delay that shrinks as the window elapses", () => {
    const c = clock();
    const limiter = createAttemptLimiter({ max: 1, windowMs: 10_000, now: c.now });
    limiter.hit("a");
    const first = limiter.hit("a").retryAfterSeconds;
    c.advance(6_000);
    const later = limiter.hit("a").retryAfterSeconds;
    expect(later).toBeLessThan(first);
  });
});
