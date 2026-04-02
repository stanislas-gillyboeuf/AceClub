import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get, post } from "../helpers";

describe("Notification API (/api/notification)", () => {
  let userId: string;
  let headers: Headers;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;
  });

  afterAll(async () => {
    await cleanupTestUser(userId);
  });

  describe("GET /api/notification", () => {
    it("should list notifications", async () => {
      const res = await get("/api/notification", {
        headers,
        query: { limit: "20", offset: "0" },
      });
      expect(res.status).toBe(200);
    });

    it("should filter unread only", async () => {
      const res = await get("/api/notification", {
        headers,
        query: { unreadOnly: "true" },
      });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/notification");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/notification/unread-count", () => {
    it("should return unread count", async () => {
      const res = await get("/api/notification/unread-count", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/notification/register-token", () => {
    it("should register a device token", async () => {
      const res = await post(
        "/api/notification/register-token",
        { token: "test-device-token-123", platform: "ios" },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/notification/register-token", {
        token: "test-token",
        platform: "ios",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/notification/unregister-token", () => {
    it("should unregister a device token", async () => {
      const res = await post(
        "/api/notification/unregister-token",
        { token: "test-device-token-123" },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/notification/mark-all-read", () => {
    it("should mark all notifications as read", async () => {
      const res = await post("/api/notification/mark-all-read", {}, { headers });
      expect(res.status).toBe(200);
    });
  });
});
