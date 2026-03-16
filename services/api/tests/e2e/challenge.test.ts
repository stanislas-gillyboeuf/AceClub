import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get } from "../helpers";

describe("Challenge API (/api/challenge)", () => {
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

  describe("GET /api/challenge", () => {
    it("should return user challenges", async () => {
      const res = await get("/api/challenge", { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/challenge");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/challenge/templates", () => {
    it("should return challenge templates", async () => {
      const res = await get("/api/challenge/templates", { headers });
      expect(res.status).toBe(200);
    });
  });
});
