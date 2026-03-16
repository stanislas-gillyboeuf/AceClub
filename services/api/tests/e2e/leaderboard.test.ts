import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
} from "../helpers";

describe("Leaderboard API (/api/leaderboard)", () => {
  let userId: string;
  let headers: Headers;
  let orgId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const org = await createTestOrganization(userId);
    orgId = org.organizationId;
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(userId);
  });

  describe("GET /api/leaderboard/global", () => {
    it("should return global leaderboard", async () => {
      const res = await get("/api/leaderboard/global", { headers });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/leaderboard/global");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/leaderboard/organization/:orgId", () => {
    it("should return organization leaderboard", async () => {
      const res = await get(`/api/leaderboard/organization/${orgId}`, { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/leaderboard/weekly", () => {
    it("should return weekly leaderboard", async () => {
      const res = await get("/api/leaderboard/weekly", { headers });
      expect(res.status).toBe(200);
    });
  });
});
