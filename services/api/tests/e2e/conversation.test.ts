import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  cleanupTestUser,
  get,
  post,
  del,
} from "../helpers";

describe("Conversation API (/api/conversation)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;
  let otherHeaders: Headers;
  let conversationId: string;
  let messageId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "Chat Partner" });
    otherUserId = other.user.id;
    otherHeaders = other.headers;
  });

  afterAll(async () => {
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("POST /api/conversation/find-or-create", () => {
    it("should create a conversation", async () => {
      const res = await post(
        "/api/conversation/find-or-create",
        { participantId: otherUserId },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      // Response is { conversationId, created }
      conversationId = data.conversationId;
      expect(conversationId).toBeDefined();
    });

    it("should return the same conversation on second call", async () => {
      const res = await post(
        "/api/conversation/find-or-create",
        { participantId: otherUserId },
        { headers },
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversationId).toBe(conversationId);
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/conversation/find-or-create", {
        participantId: otherUserId,
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/conversation", () => {
    it("should list conversations", async () => {
      const res = await get("/api/conversation", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/conversation/:id", () => {
    it("should get conversation details", async () => {
      if (!conversationId) return;
      const res = await get(`/api/conversation/${conversationId}`, { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/conversation/:id/message", () => {
    it("should send a message", async () => {
      if (!conversationId) return;
      const res = await post(
        `/api/conversation/${conversationId}/message`,
        { content: "Hello from test!", type: "text" },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      messageId = data.id;
    });

    it("should return 401 without auth", async () => {
      if (!conversationId) return;
      const res = await post(`/api/conversation/${conversationId}/message`, {
        content: "Unauthorized",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/conversation/:id/messages", () => {
    it("should list messages with pagination", async () => {
      if (!conversationId) return;
      const res = await get(`/api/conversation/${conversationId}/messages`, {
        headers,
        query: { limit: "20" },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/conversation/:id/mark-read", () => {
    it("should mark conversation as read", async () => {
      if (!conversationId) return;
      const res = await post(
        `/api/conversation/${conversationId}/mark-read`,
        {},
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/conversation/:id/mute", () => {
    it("should mute a conversation", async () => {
      if (!conversationId) return;
      const res = await post(
        `/api/conversation/${conversationId}/mute`,
        { isMuted: true },
        { headers },
      );
      expect(res.status).toBe(200);
    });

    it("should unmute a conversation", async () => {
      if (!conversationId) return;
      const res = await post(
        `/api/conversation/${conversationId}/mute`,
        { isMuted: false },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Reactions", () => {
    it("POST /api/conversation/:id/message/:messageId/reaction - should add reaction", async () => {
      if (!conversationId || !messageId) return;
      const res = await post(
        `/api/conversation/${conversationId}/message/${messageId}/reaction`,
        { emoji: "👍" },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
    });

    it("DELETE /api/conversation/:id/message/:messageId/reaction - should remove reaction", async () => {
      if (!conversationId || !messageId) return;
      const res = await del(
        `/api/conversation/${conversationId}/message/${messageId}/reaction`,
        { headers, body: { emoji: "👍" } },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/conversation/:id/message/:messageId", () => {
    it("should delete a message", async () => {
      if (!conversationId || !messageId) return;
      const res = await del(
        `/api/conversation/${conversationId}/message/${messageId}`,
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/conversation/:id", () => {
    it("should soft-delete a conversation", async () => {
      if (!conversationId) return;
      const res = await del(`/api/conversation/${conversationId}`, { headers });
      expect(res.status).toBe(200);
    });
  });
});
