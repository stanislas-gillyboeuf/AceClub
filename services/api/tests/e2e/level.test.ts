import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get } from "../helpers";

describe("Level API (/api/level)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "Other Player" });
    otherUserId = other.user.id;
  });

  afterAll(async () => {
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("GET /api/level/me", () => {
    it("should return user level", async () => {
      const res = await get("/api/level/me", { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/level/me");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/level/user/:userId", () => {
    it("should return another user level", async () => {
      const res = await get(`/api/level/user/${otherUserId}`, { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/level/history", () => {
    it("should return aces transaction history", async () => {
      const res = await get("/api/level/history", { headers });
      expect(res.status).toBe(200);
    });
  });
});
