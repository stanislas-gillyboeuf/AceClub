import type { ServerWebSocket } from "bun";
import { auth } from "../../auth";
import { redisSub, CHAT_CHANNEL } from "../../lib/redis";

// WebSocket data attached to each connection
export interface WebSocketData {
  userId: string;
  token: string;
}

// Connection store for WebSocket
const localConnections = new Map<string, Set<ServerWebSocket<WebSocketData>>>();

function addConnection(userId: string, ws: ServerWebSocket<WebSocketData>): void {
  if (!localConnections.has(userId)) {
    localConnections.set(userId, new Set());
  }
  localConnections.get(userId)!.add(ws);
  console.log(
    `[WS] User ${userId} connected. Total connections: ${localConnections.get(userId)!.size}`,
  );
}

function removeConnection(userId: string, ws: ServerWebSocket<WebSocketData>): void {
  const userConnections = localConnections.get(userId);
  if (userConnections) {
    userConnections.delete(ws);
    console.log(`[WS] User ${userId} disconnected. Remaining connections: ${userConnections.size}`);
    if (userConnections.size === 0) {
      localConnections.delete(userId);
    }
  }
}

function broadcastToLocalUser(userId: string, payload: object): boolean {
  const userConnections = localConnections.get(userId);
  if (!userConnections || userConnections.size === 0) {
    return false;
  }

  const message = JSON.stringify(payload);
  let delivered = false;

  userConnections.forEach((ws) => {
    try {
      ws.send(message);
      delivered = true;
    } catch (error) {
      console.error(`[WS] Failed to send message to user ${userId}:`, error);
    }
  });

  return delivered;
}

// Initialize Redis subscriber
export async function initializeRedisSubscriber(): Promise<void> {
  if (redisSub) {
    await redisSub.subscribe(CHAT_CHANNEL, (message, channel) => {
      if (channel === CHAT_CHANNEL) {
        try {
          const { userId, payload } = JSON.parse(message);
          broadcastToLocalUser(userId, payload);
        } catch (error) {
          console.error("[WS] Failed to parse Redis message:", error);
        }
      }
    });
    console.log(`[WS] Subscribed to Redis channel: ${CHAT_CHANNEL}`);
  }
}

// Authenticate WebSocket upgrade request
export async function authenticateWebSocket(
  req: Request,
): Promise<{ userId: string; token: string } | null> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const cookie = url.searchParams.get("cookie");

  if (!token && !cookie) {
    console.log("[WS] No token or cookie provided");
    return null;
  }

  try {
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else if (cookie) {
      headers.set("Cookie", cookie);
    }
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      console.log("[WS] Invalid token/cookie");
      return null;
    }

    return { userId: session.user.id, token: token || cookie! };
  } catch (error) {
    console.error("[WS] Auth error:", error);
    return null;
  }
}

// Bun WebSocket handlers
export const websocketHandlers = {
  open(ws: ServerWebSocket<WebSocketData>) {
    const { userId } = ws.data;
    addConnection(userId, ws);

    ws.send(
      JSON.stringify({
        type: "connected",
        userId,
        message: "Connected to chat",
      }),
    );

    console.log(`[WS] User ${userId} opened connection`);
  },

  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const { userId } = ws.data;

    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;

        case "typing":
          console.log(`[WS] User ${userId} is typing in conversation ${data.conversationId}`);
          break;

        default:
          console.log(`[WS] Unknown message type from user ${userId}:`, data.type);
      }
    } catch (error) {
      console.error("[WS] Message handling error:", error);
    }
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    const { userId } = ws.data;
    removeConnection(userId, ws);
  },

  error(ws: ServerWebSocket<WebSocketData>, error: Error) {
    console.error("[WS] WebSocket error:", error);
    const { userId } = ws.data;
    removeConnection(userId, ws);
  },
};

// Export for use in mutations (send-message.ts)
export function isUserConnectedWs(userId: string): boolean {
  const userConnections = localConnections.get(userId);
  return !!userConnections && userConnections.size > 0;
}
