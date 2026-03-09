import { redis } from "./redis";

// TTL constants (seconds)
export const CacheTTL = {
  SHORT: 60, // 1 min — user profile
  MEDIUM: 300, // 5 min — leaderboards
  LONG: 900, // 15 min — org stats
  E2EE_KEY: 3600, // 1h — public keys change very rarely
} as const;

// Cache key builders
export const CacheKeys = {
  userMe: (userId: string) => `user:me:${userId}`,
  leaderboardGlobal: (page: number, limit: number) => `leaderboard:global:${page}:${limit}`,
  leaderboardWeekly: (page: number, limit: number) => `leaderboard:weekly:${page}:${limit}`,
  leaderboardOrg: (orgId: string, page: number, limit: number) =>
    `leaderboard:org:${orgId}:${page}:${limit}`,
  orgStats: (orgId: string) => `org:stats:${orgId}`,

  // E2EE
  e2eePublicKey: (userId: string) => `e2ee:pubkey:${userId}`,

  // Conversation enrichment
  convParticipants: (conversationId: string) => `conv:participants:${conversationId}`,
  userEnrichment: (userId: string) => `user:enrichment:${userId}`,

  // Match photos
  matchPhotos: (matchId: string) => `match:photos:${matchId}`,

  // Prefixes for bulk invalidation
  PREFIX_LEADERBOARD_GLOBAL: "leaderboard:global:",
  PREFIX_LEADERBOARD_WEEKLY: "leaderboard:weekly:",
  prefixLeaderboardOrg: (orgId: string) => `leaderboard:org:${orgId}:`,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value));
    await redis.expire(key, ttlSeconds);
  } catch {
    // Silently fail — cache is best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

/**
 * Cache-through helper: returns cached value if available, otherwise runs fetcher and caches result.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const data = await fetcher();
  await cacheSet(key, data, ttlSeconds);
  return data;
}

export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const result = (await redis.send("SCAN", [cursor, "MATCH", `${prefix}*`, "COUNT", "100"])) as
        | [string, string[]]
        | null;
      if (!result) break;
      const [nextCursor, keys] = result;
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.send("DEL", keys);
      }
    } while (cursor !== "0");
  } catch {
    // Silently fail
  }
}
