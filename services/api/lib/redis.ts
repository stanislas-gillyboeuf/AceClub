import { RedisClient } from "bun";

// Use REDIS_URL (internal Railway) or REDIS_PUBLIC_URL (local dev)
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;

if (!redisUrl) {
  console.warn("[Redis] No REDIS_URL or REDIS_PUBLIC_URL found. Redis features will be disabled.");
}

function createClient(label: string): RedisClient | null {
  if (!redisUrl) return null;

  const client = new RedisClient(redisUrl, {
    autoReconnect: true,
    maxRetries: 10,
    enableOfflineQueue: true,
    enableAutoPipelining: true,
  });

  client.onconnect = () => {
    console.log(`[Redis] ${label} connected`);
  };

  client.onclose = (error) => {
    console.error(`[Redis] ${label} disconnected:`, error);
  };

  return client;
}

// Main Redis client for publishing + caching
export const redis = createClient("Publisher");

// Separate client for subscribing (Redis requires separate connections for pub/sub)
export const redisSub = createClient("Subscriber");

// Channels
export const CHAT_CHANNEL = "chat:messages";
export const TYPING_CHANNEL = "chat:typing";
