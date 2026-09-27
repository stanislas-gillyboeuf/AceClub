import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  db,
} from "../helpers";
import { member as memberTable, user as userTable } from "../../db/schema/auth/schema";
import { userPreference } from "../../db/schema/user-preference/schema";
import { matchIntent, matchRequest } from "../../db/schema/match_intents/schema";
import { ulid } from "ulid";

type Club = { orgId: string; ownerId: string; ownerHeaders: Headers };

describe("Partner discovery and player search are scoped to the active club", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const intentIds: string[] = [];
  const ghostIds: string[] = [];

  let a: Club;
  let b: Club;
  let memberA: { id: string; headers: Headers };
  let memberB: { id: string; headers: Headers; email: string; phone: string };
  let superAdmin: { id: string; headers: Headers };
  let intentB: string;

  async function createClub(name: string): Promise<Club> {
    const owner = await createTestUser({ name: `${name} owner` });
    userIds.push(owner.user.id);
    const org = await createTestOrganization(owner.user.id, { name });
    orgIds.push(org.organizationId);
    await db.insert(userPreference).values({
      id: ulid(),
      userId: owner.user.id,
      organizationId: org.organizationId,
      sport: "tennis",
      skillLevel: "intermediate",
    });
    return { orgId: org.organizationId, ownerId: owner.user.id, ownerHeaders: owner.headers };
  }

  async function addMember(club: Club, label: string, overrides?: { email?: string }) {
    const u = await createTestUser({ name: label, email: overrides?.email });
    userIds.push(u.user.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: club.orgId,
      role: "member",
      createdAt: new Date(),
    });
    await db.insert(userPreference).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: club.orgId,
      sport: "tennis",
      skillLevel: "intermediate",
    });
    return { id: u.user.id, headers: u.headers };
  }

  beforeAll(async () => {
    a = await createClub("Players Iso Club A");
    b = await createClub("Players Iso Club B");
    memberA = await addMember(a, "Players member A");

    const bEmail = `players-b-${ulid().toLowerCase()}@example.com`;
    const bPhone = "+33612340099";
    const memberBRaw = await addMember(b, "Players member B", { email: bEmail });
    await db.update(userTable).set({ phoneNumber: bPhone }).where(eq(userTable.id, memberBRaw.id));
    memberB = { ...memberBRaw, email: bEmail, phone: bPhone };

    const admin = await createTestUser({ name: "Players super admin", role: "admin" });
    userIds.push(admin.user.id);
    superAdmin = { id: admin.user.id, headers: admin.headers };

    intentB = ulid();
    await db.insert(matchIntent).values({
      id: intentB,
      userId: memberB.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(intentB);
  });

  afterAll(async () => {
    await db.delete(matchRequest).catch(() => {});
    for (const id of intentIds) await db.delete(matchIntent).where(eq(matchIntent.id, id)).catch(() => {});
    await db.delete(userPreference).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId);
    for (const userId of [...userIds, ...ghostIds]) await cleanupTestUser(userId);
  });

  it("never surfaces another club's intents in discover, and never an email", async () => {
    const res = await get("/api/match-intents/discover", { headers: memberA.headers });
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.data.map((row: { id: string }) => row.id);
    expect(ids).not.toContain(intentB);
    expect(JSON.stringify(body)).not.toContain(memberB.email);
    expect(body.isDiscoveryRestricted).toBeUndefined();
  });

  it("shows the owner's own club its intent", async () => {
    const res = await get("/api/match-intents/discover", {
      headers: memberB.headers,
      query: { organizationId: b.orgId },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.data.map((row: { id: string }) => row.id);
    expect(ids).toContain(intentB);
  });

  it("refuses discover scoped to a club the caller does not belong to", async () => {
    const res = await get("/api/match-intents/discover", {
      headers: memberA.headers,
      query: { organizationId: b.orgId },
    });
    expect(res.status).toBe(403);
  });

  it("refuses a request on an intent whose owner is in another club", async () => {
    const res = await post(`/api/match-intents/${intentB}/request`, {}, { headers: memberA.headers });
    expect(res.status).toBe(404);
  });

  it("partial search finds nothing from another club", async () => {
    const res = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: "Players member B" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toEqual([]);
  });

  it("an exact email match from another club returns one minimal result", async () => {
    const res = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: memberB.email },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toHaveLength(1);
    const [found] = body.users;
    expect(found.id).toBe(memberB.id);
    expect(found.email).toBeUndefined();
    expect(found.organizationId).toBeUndefined();
  });

  it("an exact phone match from another club also works", async () => {
    const res = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: memberB.phone },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users.map((u: { id: string }) => u.id)).toContain(memberB.id);
  });

  it("stops after 20 exact searches per hour", async () => {
    let lastStatus = 200;
    for (let i = 0; i < 21; i++) {
      const res = await get("/api/user/search", {
        headers: memberA.headers,
        query: { query: memberB.email },
      });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("the super-admin is not scoped to a club", async () => {
    const res = await get("/api/match-intents/discover", {
      headers: superAdmin.headers,
      query: { organizationId: b.orgId },
    });
    expect(res.status).toBe(200);
  });

  it("find-or-create rejects an invalid body", async () => {
    const res = await post(
      "/api/conversation/find-or-create",
      { participantId: "" },
      { headers: memberA.headers },
    );
    expect(res.status).toBe(400);
  });

  it("create-ghost never returns an email, for the creator or for anyone reusing it", async () => {
    const ghostEmail = `ghost-${ulid().toLowerCase()}@example.com`;
    const first = await post(
      "/api/user/ghost",
      { name: "Some Ghost", email: ghostEmail },
      { headers: memberB.headers },
    );
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    ghostIds.push(firstBody.id);
    expect(firstBody.email).toBeUndefined();

    // A club-less ghost (no `member` row) is still handed back — only its email is hidden. Once a
    // ghost has been imported/added to a club, reusing it from another club is refused (409); that
    // path is covered by the club-member bulk-import tests, not here.
    const second = await post(
      "/api/user/ghost",
      { name: "Some Ghost", email: ghostEmail },
      { headers: memberA.headers },
    );
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.email).toBeUndefined();
    expect(secondBody.id).toBe(firstBody.id);
  });

  it("refuses reusing a ghost that already belongs to another club", async () => {
    const ghostEmail = `ghost-clubbed-${ulid().toLowerCase()}@example.com`;
    const created = await post(
      "/api/user/ghost",
      { name: "Clubbed Ghost", email: ghostEmail },
      { headers: memberB.headers },
    );
    expect(created.status).toBe(200);
    const ghost = await created.json();
    ghostIds.push(ghost.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: ghost.id,
      organizationId: b.orgId,
      role: "member",
      createdAt: new Date(),
    });

    const reused = await post(
      "/api/user/ghost",
      { name: "Clubbed Ghost", email: ghostEmail },
      { headers: memberA.headers },
    );
    expect(reused.status).toBe(409);
  });
});
