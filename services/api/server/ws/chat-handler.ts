import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import { auth } from "../../auth";
import { redisSub, CHAT_CHANNEL } from "../../lib/redis";

// Map to track userId for each WebSocket
const wsUserMap = new WeakMap<WebSocket, string>();

// Connection store for WebSocket
const localConnectionsWs = new Map<string, Set<WebSocket>>();

function addConnectionWs(userId: string, ws: WebSocket): void {
  if (!localConnectionsWs.has(userId)) {
    localConnectionsWs.set(userId, new Set());
  }
  localConnectionsWs.get(userId)!.add(ws);
  console.log(
    `[WS] User ${userId} connected. Total connections: ${localConnectionsWs.get(userId)!.size}`
  );
}

function removeConnectionWs(userId: string, ws: WebSocket): void {
  const userConnections = localConnectionsWs.get(userId);
  if (userConnections) {
    userConnections.delete(ws);
    console.log(
      `[WS] User ${userId} disconnected. Remaining connections: ${userConnections.size}`
    );
    if (userConnections.size === 0) {
      localConnectionsWs.delete(userId);
    }
  }
}

function broadcastToLocalUserWs(userId: string, payload: object): boolean {
  const userConnections = localConnectionsWs.get(userId);
  if (!userConnections || userConnections.size === 0) {
    return false;
  }

  const message = JSON.stringify(payload);
  let delivered = false;

  userConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
        delivered = true;
      } catch (error) {
        console.error(`[WS] Failed to send message to user ${userId}:`, error);
      }
    }
  });

  return delivered;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initializeWebSocketServer(serverOrWrapper: any): WebSocketServer {
  // Handle both direct server and wrapper object from @hono/node-server
  const server =
    serverOrWrapper && typeof serverOrWrapper === "object" && "server" in serverOrWrapper
      ? serverOrWrapper.server
      : serverOrWrapper;

  const wss = new WebSocketServer({
    server: server as HttpServer,
    path: "/ws/chat",
  });

  // Initialize Redis subscriber for cross-pod message delivery
  if (redisSub) {
    redisSub.subscribe(CHAT_CHANNEL);
    console.log(`[WS] Subscribed to Redis channel: ${CHAT_CHANNEL}`);

    redisSub.on("message", (channel, message) => {
      if (channel === CHAT_CHANNEL) {
        try {
          const { userId, payload } = JSON.parse(message);
          broadcastToLocalUserWs(userId, payload);
        } catch (error) {
          console.error("[WS] Failed to parse Redis message:", error);
        }
      }
    });
  }

  wss.on("connection", async (ws, req) => {
    console.log("[WS] New connection attempt");

    // Extract token from query string
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.send(JSON.stringify({ type: "error", message: "No token provided" }));
      ws.close(4001, "Unauthorized");
      return;
    }

    try {
      // Verify the bearer token using Better Auth
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token}`);
      const session = await auth.api.getSession({ headers });

      if (!session || !session.user) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
        ws.close(4001, "Unauthorized");
        return;
      }

      const userId = session.user.id;
      wsUserMap.set(ws, userId);
      addConnectionWs(userId, ws);

      // Send connection confirmation
      ws.send(
        JSON.stringify({
          type: "connected",
          userId,
          message: "Connected to chat",
        })
      );

      // Set up ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());

          switch (message.type) {
            case "ping":
              ws.send(JSON.stringify({ type: "pong" }));
              break;

            case "typing":
              console.log(
                `[WS] User ${userId} is typing in conversation ${message.conversationId}`
              );
              break;

            default:
              console.log(`[WS] Unknown message type from user ${userId}:`, message.type);
          }
        } catch (error) {
          console.error("[WS] Message handling error:", error);
        }
      });

      ws.on("close", () => {
        clearInterval(pingInterval);
        const uid = wsUserMap.get(ws);
        if (uid) {
          removeConnectionWs(uid, ws);
          wsUserMap.delete(ws);
        }
      });

      ws.on("error", (error) => {
        console.error("[WS] WebSocket error:", error);
        clearInterval(pingInterval);
        const uid = wsUserMap.get(ws);
        if (uid) {
          removeConnectionWs(uid, ws);
          wsUserMap.delete(ws);
        }
      });
    } catch (error) {
      console.error("[WS] Auth error:", error);
      ws.send(JSON.stringify({ type: "error", message: "Authentication failed" }));
      ws.close(4001, "Unauthorized");
    }
  });

  console.log("[WS] WebSocket server initialized on /ws/chat");
  return wss;
}

// Export for use in mutations (send-message.ts)
export function isUserConnectedWs(userId: string): boolean {
  const userConnections = localConnectionsWs.get(userId);
  return !!userConnections && userConnections.size > 0;
}
