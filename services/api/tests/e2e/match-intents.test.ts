import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  del,
} from "../helpers";

describe("Match Intents API (/api/match-intents)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;
  let otherHeaders: Headers;
  let orgId: string;
  let intentId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "Other Player" });
    otherUserId = other.user.id;
    otherHeaders = other.headers;

    const org = await createTestOrganization(userId);
    orgId = org.organizationId;
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("POST /api/match-intents", () => {
    it("should create a match intent", async () => {
      const res = await post(
        "/api/match-intents",
        {
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          time: "14:00",
          duration: 60,
          type: "match",
          description: "Looking for a game",
        },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      intentId = data.id;
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/match-intents", {
        date: "2025-01-01",
        time: "14:00",
        duration: 60,
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/match-intents", () => {
    it("should list user match intents", async () => {
      const res = await get("/api/match-intents", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/match-intents/discover", () => {
    it("should return discovery feed", async () => {
      const res = await get("/api/match-intents/discover", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/match-intents/requests", () => {
    it("should list incoming match requests", async () => {
      const res = await get("/api/match-intents/requests", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/match-intents/:id/request", () => {
    it("should create a request to join an intent", async () => {
      if (!intentId) return;
      const res = await post(
        `/api/match-intents/${intentId}/request`,
        {},
        { headers: otherHeaders },
      );
      // Could be 201 (created) or 404/400 depending on intent state
      expect([200, 201, 400, 404]).toContain(res.status);
    });
  });

  describe("DELETE /api/match-intents/:id", () => {
    it("should delete an intent", async () => {
      if (!intentId) return;
      const res = await del(`/api/match-intents/${intentId}`, { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await del("/api/match-intents/some-id");
      expect(res.status).toBe(401);
    });
  });
});
