import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get, put, post } from "../helpers";

describe("User API (/api/user)", () => {
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

  describe("GET /api/user/me", () => {
    it("should return current user profile", async () => {
      const res = await get("/api/user/me", { headers });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(userId);
      expect(data.email).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/user/me");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/user/preferences", () => {
    it("should return user preferences or 404 if none set", async () => {
      const res = await get("/api/user/preferences", { headers });
      // 200 if preferences exist, 404 if not yet created
      expect([200, 404]).toContain(res.status);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/user/preferences");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/user/search", () => {
    it("should search users", async () => {
      const res = await get("/api/user/search", {
        headers,
        query: { query: "test", limit: "5" },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      // Response is { users: [...], count: number }
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
    });

    it("should return 400 without query param", async () => {
      const res = await get("/api/user/search", { headers, query: { query: "" } });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/user/profile", () => {
    it("should update user profile", async () => {
      const res = await put("/api/user/profile", { name: "Updated Name" }, { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await put("/api/user/profile", { name: "No Auth" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/user/ghost", () => {
    it("should create a ghost user", async () => {
      const res = await post(
        "/api/user/ghost",
        { name: "Ghost User", email: `ghost-${Date.now()}@example.com` },
        { headers },
      );
      // Could be 200 or 201 depending on implementation
      expect([200, 201]).toContain(res.status);
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/user/ghost", {
        name: "Ghost",
        email: "ghost@example.com",
      });
      expect(res.status).toBe(401);
    });
  });
});
