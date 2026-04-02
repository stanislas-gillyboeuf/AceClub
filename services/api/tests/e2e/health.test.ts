import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get } from "../helpers";

describe("Root API routes", () => {
  describe("GET /", () => {
    it("should return API status", async () => {
      const res = await get("/");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.message).toBe("AceClub API");
    });
  });

  describe("GET /health", () => {
    it("should return health check", async () => {
      const res = await get("/health");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
    });
  });

  describe("GET /api/session", () => {
    it("should return null session without auth", async () => {
      const res = await get("/api/session");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session).toBeNull();
      expect(data.user).toBeNull();
    });

    it("should return session for authenticated user", async () => {
      const { user, headers } = await createTestUser();
      const res = await get("/api/session", { headers });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(user.id);
      await cleanupTestUser(user.id);
    });
  });
});
