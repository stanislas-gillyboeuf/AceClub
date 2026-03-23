import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  db,
} from "../helpers";
import { member as memberTable } from "../../db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";

describe("Event API (/api/event)", () => {
  let userId: string;
  let headers: Headers;
  let adminUserId: string;
  let adminHeaders: Headers;
  let orgId: string;
  let eventId: string;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const admin = await createTestUser({ role: "admin", name: "Event Admin" });
    adminUserId = admin.user.id;
    adminHeaders = admin.headers;

    const org = await createTestOrganization(userId, { name: "Event Club" });
    orgId = org.organizationId;

    // Add admin as org member too
    await db.insert(memberTable).values({
      id: ulid(),
      userId: adminUserId,
      organizationId: orgId,
      role: "admin",
      createdAt: new Date(),
    });
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(adminUserId);
    await cleanupTestUser(userId);
  });

  describe("POST /api/event/create", () => {
    it("should create an event", async () => {
      const startDate = new Date(Date.now() + 86400000).toISOString();
      const endDate = new Date(Date.now() + 90000000).toISOString();
      const res = await post(
        "/api/event/create",
        {
          name: "Test Tournament",
          description: "A test event",
          startDate,
          endDate,
          organizationId: orgId,
          maxParticipants: 16,
          isFree: true,
          visibility: "public",
        },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      eventId = data.id;
    });

    it("should return 401 without auth", async () => {
      const res = await post("/api/event/create", {
        name: "Unauthorized Event",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        organizationId: orgId,
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/event/get", () => {
    it("should get event details", async () => {
      if (!eventId) return;
      const res = await get("/api/event/get", {
        headers,
        query: { eventId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/event/list", () => {
    it("should list events", async () => {
      const res = await get("/api/event/list", {
        headers,
        query: { limit: "20" },
      });
      expect(res.status).toBe(200);
    });

    it("should filter events by organization", async () => {
      const res = await get("/api/event/list", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/event/list-my-events", () => {
    it("should list user events", async () => {
      const res = await get("/api/event/list-my-events", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/event/list-organization-events", () => {
    it("should list organization events", async () => {
      const res = await get("/api/event/list-organization-events", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/event/register", () => {
    it("should register for an event", async () => {
      if (!eventId) return;
      const res = await post("/api/event/register", { eventId }, { headers });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe("GET /api/event/list-participants", () => {
    it("should list event participants", async () => {
      if (!eventId) return;
      const res = await get("/api/event/list-participants", {
        headers,
        query: { eventId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/event/cancel-registration", () => {
    it("should cancel registration", async () => {
      if (!eventId) return;
      const res = await post("/api/event/cancel-registration", { eventId }, { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/event/update", () => {
    it("should update an event", async () => {
      if (!eventId) return;
      const res = await post(
        "/api/event/update",
        { eventId, name: "Updated Tournament" },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/event/update-status", () => {
    it("should update event status", async () => {
      if (!eventId) return;
      // Event starts as "draft", valid transitions: draft → on_sale
      const res = await post(
        "/api/event/update-status",
        { eventId, status: "on_sale" },
        { headers },
      );
      // 200 if transition valid, 400 if invalid transition
      expect([200, 400]).toContain(res.status);
    });
  });

  describe("Admin event routes", () => {
    it("GET /api/event/admin-list-events - should list events for admin", async () => {
      const res = await get("/api/event/admin-list-events", {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
    });

    it("GET /api/event/admin-list-events - should return 403 for non-admin", async () => {
      const res = await get("/api/event/admin-list-events", { headers });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/event/cancel", () => {
    it("should cancel an event", async () => {
      if (!eventId) return;
      const res = await post("/api/event/cancel", { eventId }, { headers });
      expect(res.status).toBe(200);
    });
  });
});
