import { AppState, Platform } from "react-native";
import * as Network from "expo-network";
import { getAuthCookie, BASE_URL } from "@/lib/api";
import type { Message } from "@/types/conversation";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";

export type WebSocketEvent =
  | { type: "connected" }
  | { type: "reconnected" }
  | { type: "disconnected" }
  | { type: "newMessage"; message: Message }
  | { type: "typing"; conversationId: string; userId: string }
  | { type: "messageRead"; conversationId: string; userId: string }
  | { type: "newReaction"; messageId: string; conversationId: string; emoji: string; user: { id: string; name: string } }
  | { type: "reactionRemoved"; messageId: string; conversationId: string; emoji: string; userId: string }
  | { type: "error"; error: Error };

type EventListener = (event: WebSocketEvent) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30;
  private shouldBeConnected = false;
  private hasConnectedBefore = false;
  private awaitingPong = false;
  private listeners: Set<EventListener> = new Set();
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private _connectionState: ConnectionState = "disconnected";

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  get isConnected(): boolean {
    return this._connectionState === "connected";
  }

  // Event subscription
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: WebSocketEvent): void {
    this.listeners.forEach((l) => l(event));
  }

  private setConnectionState(state: ConnectionState): void {
    this._connectionState = state;
    // Notify listeners of state change through events
    if (state === "disconnected") {
      this.emit({ type: "disconnected" });
    }
  }

  // Connection
  async connect(): Promise<void> {
    this.shouldBeConnected = true;

    if (this._connectionState === "connected" && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.cancelReconnect();
    this.cleanup();

    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      this.setConnectionState("disconnected");
      return;
    }

    const isReconnect = this.hasConnectedBefore;
    this._connectionState = isReconnect ? "reconnecting" : "connecting";

    try {
      const cookie = await getAuthCookie();
      if (!cookie) {
        this.setConnectionState("disconnected");
        return;
      }

      // Build WS URL from the API base URL
      const wsProtocol = BASE_URL.startsWith("https") ? "wss" : "ws";
      const host = BASE_URL.replace(/^https?:\/\//, "");
      const wsURL = `${wsProtocol}://${host}/ws/chat?cookie=${encodeURIComponent(cookie)}`;

      const ws = new WebSocket(wsURL);

      ws.onopen = () => {
        this._connectionState = "connected";
        this.awaitingPong = false;
        this.reconnectAttempts = 0;
        this.hasConnectedBefore = true;
        this.emit(isReconnect ? { type: "reconnected" } : { type: "connected" });
        this.startPing();
      };

      ws.onmessage = (event) => {
        this.handleMessage(event.data as string);
      };

      ws.onerror = () => {
        // onclose will be called after onerror
      };

      ws.onclose = () => {
        if (!this.shouldBeConnected) return;
        this.cleanup();
        this._connectionState = "disconnected";
        this.emit({ type: "error", error: new Error("WebSocket closed") });
        this.scheduleReconnect();
      };

      this.ws = ws;
      this.setupLifecycle();
    } catch (error) {
      this.setConnectionState("disconnected");
      this.emit({ type: "error", error: error as Error });
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.shouldBeConnected = false;
    this.cancelReconnect();
    this.cleanup();
    this.setConnectionState("disconnected");
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  sendTypingIndicator(conversationId: string): void {
    this.send({ type: "typing", conversationId });
  }

  // Private methods
  private send(message: Record<string, string>): void {
    if (this._connectionState !== "connected" || this.ws?.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(message));
    } catch {
      // Silent
    }
  }

  private handleMessage(text: string): void {
    try {
      const json = JSON.parse(text);
      const type = json.type as string;

      switch (type) {
        case "connected":
          break;

        case "new_message":
          if (json.message) {
            this.emit({ type: "newMessage", message: json.message as Message });
          }
          break;

        case "typing":
          if (json.conversationId && json.userId) {
            this.emit({
              type: "typing",
              conversationId: json.conversationId,
              userId: json.userId,
            });
          }
          break;

        case "read":
          if (json.conversationId && json.userId) {
            this.emit({
              type: "messageRead",
              conversationId: json.conversationId,
              userId: json.userId,
            });
          }
          break;

        case "new_reaction":
          if (json.messageId && json.conversationId && json.emoji && json.user) {
            this.emit({
              type: "newReaction",
              messageId: json.messageId,
              conversationId: json.conversationId,
              emoji: json.emoji,
              user: json.user,
            });
          }
          break;

        case "reaction_removed":
          if (json.messageId && json.conversationId && json.emoji && json.userId) {
            this.emit({
              type: "reactionRemoved",
              messageId: json.messageId,
              conversationId: json.conversationId,
              emoji: json.emoji,
              userId: json.userId,
            });
          }
          break;

        case "pong":
          this.awaitingPong = false;
          break;

        case "error":
          console.warn("[WS] Server error:", json.message);
          break;
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.awaitingPong) {
        console.warn("[WS] Pong timeout — forcing reconnect");
        this.cleanup();
        this._connectionState = "disconnected";
        this.scheduleReconnect();
        return;
      }
      this.awaitingPong = true;
      this.send({ type: "ping" });
    }, 15000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.awaitingPong = false;
  }

  private cleanup(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch {
        // Already closed
      }
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldBeConnected) return;
    this.cancelReconnect();

    this.reconnectAttempts += 1;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    this._connectionState = "reconnecting";

    this.reconnectTimeout = setTimeout(() => {
      if (!this.shouldBeConnected) return;
      this.connect();
    }, delay * 1000);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private setupLifecycle(): void {
    if (this.appStateSubscription) return;

    this.appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && this.shouldBeConnected) {
        this.reconnectAttempts = 0;
        this.connect();
      } else if (nextState === "background") {
        this.cancelReconnect();
        this.cleanup();
        this._connectionState = "disconnected";
      }
    });
  }
}

export const wsManager = new WebSocketManager();
