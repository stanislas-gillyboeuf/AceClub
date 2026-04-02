import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get } from "../helpers";

describe("Streak API (/api/streak)", () => {
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

  describe("GET /api/streak/me", () => {
    it("should return user streak", async () => {
      const res = await get("/api/streak/me", { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/streak/me");
      expect(res.status).toBe(401);
    });
  });
});
