import { redis, CHAT_CHANNEL } from "../../../lib/redis";

/** Notifies both sides of a match_request card (in chat) that its status changed, so the already-rendered message updates live instead of requiring a reload. */
export async function broadcastMatchRequestUpdate(
  matchRequestId: string,
  status: "accepted" | "rejected",
  userIds: string[],
) {
  if (!redis) return;
  const payload = { type: "match_request_updated", matchRequestId, status };
  try {
    await Promise.all(userIds.map((userId) => redis?.publish(CHAT_CHANNEL, JSON.stringify({ userId, payload }))));
  } catch {
    console.warn("[broadcast] Redis publish failed, skipping match_request_updated broadcast");
  }
}
