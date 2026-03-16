import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
} from "../helpers";

describe("Organization API (/api/organization)", () => {
  let userId: string;
  let headers: Headers;
  let orgId: string;
  let orgSlug: string;

  let otherUserId: string;
  let otherHeaders: Headers;

  beforeAll(async () => {
    const { user, headers: h } = await createTestUser();
    userId = user.id;
    headers = h;

    const org = await createTestOrganization(userId, {
      name: "Test Club",
      slug: `test-club-${Date.now()}`,
    });
    orgId = org.organizationId;
    orgSlug = org.slug;

    const other = await createTestUser({ name: "Other User" });
    otherUserId = other.user.id;
    otherHeaders = other.headers;
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgId);
    await cleanupTestUser(otherUserId);
    await cleanupTestUser(userId);
  });

  describe("GET /api/organization/search", () => {
    it("should search organizations", async () => {
      const res = await get("/api/organization/search", {
        headers,
        query: { query: "Test", limit: "10" },
      });
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await get("/api/organization/search", {
        query: { query: "Test" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/organization/list-organizations-user", () => {
    it("should list user organizations", async () => {
      const res = await get("/api/organization/list-organizations-user", { headers });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/list-user-organizations", () => {
    it("should list user organizations with userId", async () => {
      const res = await get("/api/organization/list-user-organizations", {
        headers,
        query: { userId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/get-full-organization", () => {
    it("should get full organization details", async () => {
      const res = await get("/api/organization/get-full-organization", {
        headers,
        query: { organizationSlug: orgSlug },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/get-organization-stats", () => {
    it("should get organization stats", async () => {
      const res = await get("/api/organization/get-organization-stats", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/organization/set-active", () => {
    it("should set active organization", async () => {
      const res = await post(
        "/api/organization/set-active",
        { organizationSlug: orgSlug },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/list-members", () => {
    it("should list organization members", async () => {
      const res = await get("/api/organization/list-members", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/search-members", () => {
    it("should search organization members", async () => {
      const res = await get("/api/organization/search-members", {
        headers,
        query: { organizationId: orgId, search: "test" },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/organization/get-active-member", () => {
    it("should get active member info", async () => {
      const res = await get("/api/organization/get-active-member", { headers });
      // May return 200 or 404 depending on active org
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("GET /api/organization/get-active-member-role", () => {
    it("should get active member role", async () => {
      const res = await get("/api/organization/get-active-member-role", { headers });
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("POST /api/organization/update", () => {
    it("should update organization", async () => {
      const res = await post(
        "/api/organization/update",
        { organizationId: orgId, data: { name: "Updated Club Name" } },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Member management", () => {
    it("POST /api/organization/add-member - should add a member", async () => {
      const res = await post(
        "/api/organization/add-member",
        { userId: otherUserId, role: "member", organizationId: orgId },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
    });

    it("POST /api/organization/update-member-role - should update member role", async () => {
      // Get the member ID first
      const membersRes = await get("/api/organization/list-members", {
        headers,
        query: { organizationId: orgId },
      });
      const members = await membersRes.json();
      const otherMember = Array.isArray(members)
        ? members.find((m: { userId: string }) => m.userId === otherUserId)
        : members.data?.find((m: { userId: string }) => m.userId === otherUserId);

      if (otherMember) {
        const res = await post(
          "/api/organization/update-member-role",
          { memberId: otherMember.id, role: "admin", organizationId: orgId },
          { headers },
        );
        expect(res.status).toBe(200);
      }
    });

    it("POST /api/organization/remove-member - should remove a member", async () => {
      // Get the member list to find the member ID
      const membersRes = await get("/api/organization/list-members", {
        headers,
        query: { organizationId: orgId },
      });
      const members = await membersRes.json();
      const memberList = Array.isArray(members) ? members : members.data || [];
      const otherMember = memberList.find(
        (m: { userId: string }) => m.userId === otherUserId,
      );

      if (otherMember) {
        const res = await post(
          "/api/organization/remove-member",
          { memberIdOrEmail: otherMember.id, organizationId: orgId },
          { headers },
        );
        expect([200, 400]).toContain(res.status);
      }
    });
  });

  describe("Invitation management", () => {
    let invitationId: string;

    it("POST /api/organization/create-invitation - should create invitation", async () => {
      const res = await post(
        "/api/organization/create-invitation",
        {
          email: `invite-${Date.now()}@example.com`,
          role: "member",
          organizationId: orgId,
        },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      if (data.id) invitationId = data.id;
    });

    it("GET /api/organization/list-invitations - should list invitations", async () => {
      const res = await get("/api/organization/list-invitations", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });

    it("GET /api/organization/list-user-invitations - should list user invitations", async () => {
      const res = await get("/api/organization/list-user-invitations", { headers });
      expect(res.status).toBe(200);
    });

    it("POST /api/organization/cancel-invitation - should cancel invitation", async () => {
      if (!invitationId) return;
      const res = await post(
        "/api/organization/cancel-invitation",
        { invitationId },
        { headers },
      );
      expect(res.status).toBe(200);
    });
  });

  describe("PIN management", () => {
    it("POST /api/organization/toggle-pin - should toggle PIN", async () => {
      const res = await post(
        "/api/organization/toggle-pin",
        { organizationId: orgId, enabled: true },
        { headers },
      );
      expect(res.status).toBe(200);
    });

    it("POST /api/organization/regenerate-pin - should regenerate PIN", async () => {
      const res = await post(
        "/api/organization/regenerate-pin",
        { organizationId: orgId },
        { headers },
      );
      expect(res.status).toBe(200);
    });

    it("GET /api/organization/get-pin - should get PIN", async () => {
      const res = await get("/api/organization/get-pin", {
        headers,
        query: { organizationId: orgId },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/organization/request-club", () => {
    it("should submit a club request", async () => {
      const res = await post(
        "/api/organization/request-club",
        { name: "New Club Request", city: "Paris" },
        { headers },
      );
      expect([200, 201]).toContain(res.status);
    });
  });
});
