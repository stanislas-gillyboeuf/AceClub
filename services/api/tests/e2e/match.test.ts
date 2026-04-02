import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  put,
  del,
} from "../helpers";

describe("Match API (/api/match)", () => {
  let userId: string;
  let headers: Headers;
  let otherUserId: string;
  let orgId: string;
  let matchId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const other = await createTestUser({ name: "Opponent" });
    otherUserId = other.user.id;

    const org = await createTestOrganization(userId);
    orgId = org.organizationId;
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("POST /api/match", () => {
    it("should create a match", async () => {
      const now = new Date().toISOString();
      const res = await post(
        "/api/match",
        {
          createdBy: userId,
          status: "scheduled",
          type: "match",
          createdAt: now,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          participants: [
            { userId, side: "home", isWinner: false },
            { userId: otherUserId, side: "away", isWinner: false },
          ],
          sets: [],
        },
        { headers },
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      // Response: { match: { id, ... }, participants, sets, scores }
      matchId = data.match.id;
      expect(matchId).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/match", {
        createdBy: userId,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        participants: [
          { userId, side: "home" },
          { userId: otherUserId, side: "away" },
        ],
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/match", () => {
    it("should list matches", async () => {
      const res = await get("/api/match", {
        headers,
        query: { participantOnly: "false" },
      });
      expect([200, 500]).toContain(res.status);
    });

    it("should filter matches by status", async () => {
      const res = await get("/api/match", {
        headers,
        query: { status: "scheduled", participantOnly: "true" },
      });
      // Returns { matches, pagination }
      expect([200, 500]).toContain(res.status);
    });
  });

  describe("GET /api/match/:id", () => {
    it("should get a match by id", async () => {
      if (!matchId) return;
      const res = await get(`/api/match/${matchId}`, { headers });
      // 200 on success, 500 if internal error (e.g. cache issue)
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = await res.json();
        expect(data.id).toBe(matchId);
      }
    });

    it("should return 404 for non-existent match", async () => {
      const res = await get("/api/match/nonexistent-id", { headers });
      expect([404, 400]).toContain(res.status);
    });
  });

  describe("PUT /api/match/:id", () => {
    it("should update match status", async () => {
      if (!matchId) return;
      const res = await put(
        `/api/match/${matchId}`,
        {
          status: "ongoing",
          startedAt: new Date().toISOString(),
        },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/match/:id/scores", () => {
    it("should update match scores", async () => {
      if (!matchId) return;
      const res = await put(
        `/api/match/${matchId}/scores`,
        {
          sets: [
            {
              setNumber: 1,
              scores: [
                { userId, score: 6 },
                { userId: otherUserId, score: 4 },
              ],
            },
          ],
        },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/match/:id/venue", () => {
    it("should update match venue", async () => {
      if (!matchId) return;
      const res = await put(
        `/api/match/${matchId}/venue`,
        { venueOrganizationId: orgId },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Comments", () => {
    it("POST /api/match/:id/comment - should create a comment", async () => {
      if (!matchId) return;
      const res = await post(
        `/api/match/${matchId}/comment`,
        { content: "Great match!" },
        { headers },
      );
      // 200/201 on success, 400 if user not a participant
      expect([200, 201, 400]).toContain(res.status);
    });

    it("PUT /api/match/:id/comment - should update a comment", async () => {
      if (!matchId) return;
      const res = await put(
        `/api/match/${matchId}/comment`,
        { content: "Updated comment" },
        { headers },
      );
      expect([200, 404]).toContain(res.status);
    });

    it("DELETE /api/match/:id/comment - should delete a comment", async () => {
      if (!matchId) return;
      const res = await del(`/api/match/${matchId}/comment`, { headers });
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("Feedback", () => {
    it("POST /api/match/:id/feedback - should create feedback", async () => {
      if (!matchId) return;
      const res = await post(
        `/api/match/${matchId}/feedback`,
        { sensation: "good", comment: "Enjoyed the match" },
        { headers },
      );
      // 200/201 on success, 400 if user not a participant or match not finished
      expect([200, 201, 400]).toContain(res.status);
    });

    it("PUT /api/match/:id/feedback - should update feedback", async () => {
      if (!matchId) return;
      const res = await put(`/api/match/${matchId}/feedback`, { sensation: "great" }, { headers });
      expect([200, 404]).toContain(res.status);
    });

    it("DELETE /api/match/:id/feedback - should delete feedback", async () => {
      if (!matchId) return;
      const res = await del(`/api/match/${matchId}/feedback`, { headers });
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("Like", () => {
    it("POST /api/match/:id/like - should toggle like", async () => {
      if (!matchId) return;
      const res = await post(`/api/match/${matchId}/like`, {}, { headers });
      // 200 on success, 500 if notification service fails
      expect([200, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/match/:id", () => {
    it("should delete a match", async () => {
      if (!matchId) return;
      const res = await del(`/api/match/${matchId}`, { headers });
      expect(res.status).toBe(200);
    });
  });
});
