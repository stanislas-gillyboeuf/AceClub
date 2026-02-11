import Redis from "ioredis";

// Use REDIS_URL (internal Railway) or REDIS_PUBLIC_URL (local dev)
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;

if (!redisUrl) {
  console.warn("[Redis] No REDIS_URL or REDIS_PUBLIC_URL found. Redis features will be disabled.");
}

// ioredis options: null = retry indefinitely (avoids MaxRetriesPerRequestError when Redis is temporarily unreachable)
const redisOptions = {
  maxRetriesPerRequest: null as const,
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
};

// Main Redis client for publishing
export const redis = redisUrl ? new Redis(redisUrl, redisOptions) : null;

// Separate client for subscribing (Redis requires separate connections for pub/sub)
export const redisSub = redisUrl ? new Redis(redisUrl, redisOptions) : null;

// Channels
export const CHAT_CHANNEL = "chat:messages";
export const TYPING_CHANNEL = "chat:typing";

// Connection status logging
if (redis) {
  redis.on("connect", () => {
    console.log("[Redis] Publisher connected");
  });

  redis.on("error", (err) => {
    console.error("[Redis] Publisher error:", err.message);
  });
}

if (redisSub) {
  redisSub.on("connect", () => {
    console.log("[Redis] Subscriber connected");
  });

  redisSub.on("error", (err) => {
    console.error("[Redis] Subscriber error:", err.message);
  });
}
