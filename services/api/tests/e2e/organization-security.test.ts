import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ulid } from "ulid";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  db,
} from "../helpers";
import { invitation, member, organization } from "../../db/schema";
import { and, eq } from "drizzle-orm";

interface Club {
  ownerId: string;
  ownerHeaders: Headers;
  orgId: string;
}

async function createClub(label: string): Promise<Club> {
  const owner = await createTestUser({ name: `Owner ${label}` });
  const org = await createTestOrganization(owner.user.id, { name: `Club ${label}` });
  return { ownerId: owner.user.id, ownerHeaders: owner.headers, orgId: org.organizationId };
}

describe("organization membership security", () => {
  let clubA: Club;
  let clubB: Club;
  const userIds: string[] = [];
  let playerA: { id: string; headers: Headers };
  let outsider: { id: string; headers: Headers };

  beforeAll(async () => {
    clubA = await createClub("A");
    clubB = await createClub("B");

    const p = await createTestUser({ name: "Player A" });
    playerA = { id: p.user.id, headers: p.headers };
    await db.insert(member).values({
      id: ulid(),
      userId: playerA.id,
      organizationId: clubA.orgId,
      role: "member",
      createdAt: new Date(),
    });

    const o = await createTestUser({ name: "Outsider" });
    outsider = { id: o.user.id, headers: o.headers };

    userIds.push(clubA.ownerId, clubB.ownerId, playerA.id, outsider.id);
  });

  afterAll(async () => {
    await db.delete(invitation).where(eq(invitation.organizationId, clubB.orgId));
    await cleanupTestOrganization(clubA.orgId);
    await cleanupTestOrganization(clubB.orgId);
    for (const id of userIds) await cleanupTestUser(id);
  });

  describe("add-member", () => {
    it("a member of club A cannot add someone to club B", async () => {
      const res = await post(
        "/api/organization/add-member",
        { userId: outsider.id, role: "member", organizationId: clubB.orgId },
        { headers: playerA.headers },
      );
      expect(res.status).toBe(403);
      const rows = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, outsider.id), eq(member.organizationId, clubB.orgId)));
      expect(rows).toHaveLength(0);
    });

    it("nobody can make themselves owner or admin of a club", async () => {
      for (const role of ["owner", "admin"]) {
        const res = await post(
          "/api/organization/add-member",
          { userId: playerA.id, role, organizationId: clubB.orgId },
          { headers: playerA.headers },
        );
        expect(res.status).toBe(403);
      }
      const rows = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, playerA.id), eq(member.organizationId, clubB.orgId)));
      expect(rows).toHaveLength(0);
    });

    it("a club admin cannot assign the owner role", async () => {
      const res = await post(
        "/api/organization/add-member",
        { userId: outsider.id, role: "owner", organizationId: clubB.orgId },
        { headers: clubB.ownerHeaders },
      );
      expect(res.status).toBe(403);
    });

    it("the direct Better Auth endpoints are closed", async () => {
      const res = await post(
        "/api/auth/organization/add-member",
        { userId: outsider.id, role: "owner", organizationId: clubB.orgId },
        { headers: playerA.headers },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("join with a PIN", () => {
    beforeAll(async () => {
      await db
        .update(organization)
        .set({ pin: "1234", pinEnabled: true })
        .where(eq(organization.id, clubB.orgId));
    });

    it("refuses a wrong PIN and adds nobody", async () => {
      const res = await post(
        "/api/organization/join",
        { organizationId: clubB.orgId, pin: "0000" },
        { headers: outsider.headers },
      );
      expect(res.status).toBe(403);
      const rows = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, outsider.id), eq(member.organizationId, clubB.orgId)));
      expect(rows).toHaveLength(0);
    });

    it("the legacy add-member self-join needs the right PIN too", async () => {
      const res = await post(
        "/api/organization/add-member",
        { userId: outsider.id, role: "member", organizationId: clubB.orgId },
        { headers: outsider.headers },
      );
      expect(res.status).toBe(403);
    });

    it("accepts the right PIN as a plain member", async () => {
      const res = await post(
        "/api/organization/join",
        { organizationId: clubB.orgId, pin: "1234" },
        { headers: outsider.headers },
      );
      expect(res.status).toBe(200);
      const [row] = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, outsider.id), eq(member.organizationId, clubB.orgId)));
      expect(row?.role).toBe("member");
    });

    it("verify-pin is rate limited", async () => {
      let last = 0;
      for (let i = 0; i < 7; i++) {
        const res = await post(
          "/api/organization/verify-pin",
          { organizationId: clubB.orgId, pin: "9999" },
          { headers: playerA.headers },
        );
        last = res.status;
      }
      expect(last).toBe(429);
    });
  });

  describe("accept-invitation", () => {
    it("an invitation addressed to someone else does not cost the caller their club", async () => {
      const invitationId = ulid();
      await db.insert(invitation).values({
        id: invitationId,
        organizationId: clubB.orgId,
        email: `someone-else-${ulid().toLowerCase()}@example.com`,
        role: "member",
        status: "pending",
        expiresAt: new Date(Date.now() + 86_400_000),
        inviterId: clubB.ownerId,
      });

      const res = await post(
        "/api/organization/accept-invitation",
        { invitationId },
        { headers: playerA.headers },
      );
      expect(res.status).toBe(404);

      const rows = await db
        .select()
        .from(member)
        .where(and(eq(member.userId, playerA.id), eq(member.organizationId, clubA.orgId)));
      expect(rows).toHaveLength(1);
    });
  });

  describe("directories", () => {
    it("search-members and stats of club B are closed to a member of club A", async () => {
      const search = await get("/api/organization/search-members", {
        headers: playerA.headers,
        query: { organizationId: clubB.orgId },
      });
      expect(search.status).toBe(403);

      const stats = await get("/api/organization/get-organization-stats", {
        headers: playerA.headers,
        query: { organizationId: clubB.orgId },
      });
      expect(stats.status).toBe(403);
    });

    it("a member still sees their own club", async () => {
      const search = await get("/api/organization/search-members", {
        headers: playerA.headers,
        query: { organizationId: clubA.orgId },
      });
      expect(search.status).toBe(200);
      const stats = await get("/api/organization/get-organization-stats", {
        headers: playerA.headers,
        query: { organizationId: clubA.orgId },
      });
      expect(stats.status).toBe(200);
    });

    it("list-user-organizations is forced to the callers own clubs", async () => {
      const res = await get("/api/organization/list-user-organizations", {
        headers: playerA.headers,
        query: { userId: clubB.ownerId },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{ id: string }>;
      expect(data.map((o) => o.id)).toEqual([clubA.orgId]);
    });

    it("list-invitations is reserved to club admins", async () => {
      const asMember = await get("/api/organization/list-invitations", {
        headers: playerA.headers,
        query: { organizationId: clubA.orgId },
      });
      expect(asMember.status).toBe(403);

      const asOwner = await get("/api/organization/list-invitations", {
        headers: clubA.ownerHeaders,
        query: { organizationId: clubA.orgId },
      });
      expect(asOwner.status).toBe(200);
    });
  });
});
