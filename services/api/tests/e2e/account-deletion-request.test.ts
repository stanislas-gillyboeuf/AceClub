import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestUser, get, post } from "../helpers";

describe("Account Deletion Request API (/api/account-deletion-request)", () => {
  let adminUserId: string;
  let adminHeaders: Headers;
  let regularHeaders: Headers;
  let regularUserId: string;

  beforeAll(async () => {
    const admin = await createTestUser({ role: "admin", name: "Deletion Admin" });
    adminUserId = admin.user.id;
    adminHeaders = admin.headers;

    const regular = await createTestUser({ name: "Regular User" });
    regularUserId = regular.user.id;
    regularHeaders = regular.headers;
  });

  afterAll(async () => {
    await cleanupTestUser(regularUserId);
    await cleanupTestUser(adminUserId);
  });

  describe("POST /api/account-deletion-request", () => {
    it("should create a deletion request (no auth required)", async () => {
      const res = await post("/api/account-deletion-request", {
        email: "delete-me@example.com",
        firstName: "John",
        lastName: "Doe",
        clubName: "Test Club",
        reason: "Testing deletion",
      });
      expect([200, 201]).toContain(res.status);
    });

    it("should return 400 with invalid data", async () => {
      const res = await post("/api/account-deletion-request", {
        email: "not-an-email",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/account-deletion-request/list", () => {
    it("should list deletion requests for admin", async () => {
      const res = await get("/api/account-deletion-request/list", {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
    });

    it("should return 403 for non-admin", async () => {
      const res = await get("/api/account-deletion-request/list", {
        headers: regularHeaders,
      });
      expect(res.status).toBe(403);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/account-deletion-request/list");
      expect(res.status).toBe(401);
    });
  });
});
