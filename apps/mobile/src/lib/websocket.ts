import { useWebSocketStore } from "@/stores/websocket";
import { storage } from "./storage";

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? "ws://localhost:3000";

type WSEventHandler = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<WSEventHandler>>();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const token = await storage.getToken();
    if (!token) return;

    useWebSocketStore.getState().setStatus("connecting");

    this.ws = new WebSocket(`${WS_URL}/ws/chat?token=${encodeURIComponent(token)}`);

    this.ws.onopen = () => {
      useWebSocketStore.getState().setStatus("connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, ...rest } = parsed;
        const eventHandlers = this.handlers.get(type);
        if (eventHandlers) {
          eventHandlers.forEach((handler) => handler(rest));
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      useWebSocketStore.getState().setStatus("disconnected");
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.ws?.close();
    this.ws = null;
    useWebSocketStore.getState().setStatus("disconnected");
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: WSEventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  send(type: string, data?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const wsManager = new WebSocketManager();
