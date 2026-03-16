import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get, put } from "../helpers";

describe("Reward API (/api/reward)", () => {
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

  describe("GET /api/reward/badges", () => {
    it("should return user badges", async () => {
      const res = await get("/api/reward/badges", { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/reward/badges");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/reward/badges/all", () => {
    it("should return all available badges", async () => {
      const res = await get("/api/reward/badges/all", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/reward/titles", () => {
    it("should return user titles", async () => {
      const res = await get("/api/reward/titles", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/reward/titles/equip", () => {
    it("should handle equip title request", async () => {
      const res = await put("/api/reward/titles/equip", { titleId: null }, { headers });
      // Could be 200 or 400/404 if no title exists
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});
