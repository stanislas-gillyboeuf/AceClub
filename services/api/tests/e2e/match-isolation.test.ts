import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  post,
  put,
  db,
} from "../helpers";
import { member as memberTable } from "../../db/schema/auth/schema";
import { match, matchParticipant, matchFeedback } from "../../db/schema/match/schema";
import { ulid } from "ulid";

type Club = { orgId: string; ownerId: string; ownerHeaders: Headers };

describe("Matches, feeds and leaderboards are scoped to clubs", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const matchIds: string[] = [];

  let a: Club;
  let b: Club;
  let c: Club;
  let memberA: { id: string; headers: Headers };
  let memberB: { id: string; headers: Headers };
  let memberC: { id: string; headers: Headers };
  let superAdmin: { id: string; headers: Headers };

  let matchAA: string;
  let matchBB: string;
  let matchAB: string;
  let matchHiddenFromA: string;

  async function createClub(name: string): Promise<Club> {
    const owner = await createTestUser({ name: `${name} owner` });
    userIds.push(owner.user.id);
    const org = await createTestOrganization(owner.user.id, { name });
    orgIds.push(org.organizationId);
    return { orgId: org.organizationId, ownerId: owner.user.id, ownerHeaders: owner.headers };
  }

  async function addMember(club: Club, label: string) {
    const u = await createTestUser({ name: label });
    userIds.push(u.user.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: club.orgId,
      role: "member",
      createdAt: new Date(),
    });
    return { id: u.user.id, headers: u.headers };
  }

  async function insertMatch(p1: string, p2: string) {
    const id = ulid();
    await db.insert(match).values({
      id,
      createdBy: p1,
      status: "finished",
      createdAt: new Date(),
    });
    // Settled fixtures: these tests are about club isolation, not confirmation (covered by
    // tests/e2e/match-confirmation.test.ts) — never leave confirmedAt null here.
    await db.insert(matchParticipant).values([
      { id: ulid(), matchId: id, userId: p1, side: "home", confirmedAt: new Date() },
      { id: ulid(), matchId: id, userId: p2, side: "away", confirmedAt: new Date() },
    ]);
    matchIds.push(id);
    return id;
  }

  beforeAll(async () => {
    a = await createClub("Match Iso Club A");
    b = await createClub("Match Iso Club B");
    c = await createClub("Match Iso Club C");
    memberA = await addMember(a, "Match member A");
    memberB = await addMember(b, "Match member B");
    memberC = await addMember(c, "Match member C");

    const admin = await createTestUser({ name: "Match super admin", role: "admin" });
    userIds.push(admin.user.id);
    superAdmin = { id: admin.user.id, headers: admin.headers };

    matchAA = await insertMatch(a.ownerId, memberA.id);
    matchBB = await insertMatch(b.ownerId, memberB.id);
    matchAB = await insertMatch(memberA.id, memberB.id);

    matchHiddenFromA = await insertMatch(a.ownerId, memberA.id);
    await db.insert(matchFeedback).values({
      id: ulid(),
      matchId: matchHiddenFromA,
      userId: memberA.id,
      sensation: "good",
      visibleToClub: false,
    });
  });

  afterAll(async () => {
    await db.delete(matchFeedback).catch(() => {});
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId);
    for (const userId of userIds) await cleanupTestUser(userId);
  });

  it("a club's feed only shows matches with a participant from that club", async () => {
    const res = await get("/api/match", {
      headers: memberA.headers,
      query: { organizationId: a.orgId },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.matches.map((m: { id: string }) => m.id);
    expect(ids).toContain(matchAA);
    expect(ids).toContain(matchAB);
    expect(ids).not.toContain(matchBB);
  });

  it("a member of club C sees nothing from A or B", async () => {
    const res = await get("/api/match", {
      headers: memberC.headers,
      query: { organizationId: c.orgId },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.matches.map((m: { id: string }) => m.id);
    expect(ids).not.toContain(matchAA);
    expect(ids).not.toContain(matchBB);
    expect(ids).not.toContain(matchAB);
  });

  it("a match hidden by a participant (visibleToClub=false) disappears from that club's feed", async () => {
    const res = await get("/api/match", {
      headers: a.ownerHeaders,
      query: { organizationId: a.orgId },
    });
    const body = await res.json();
    const ids = body.matches.map((m: { id: string }) => m.id);
    expect(ids).not.toContain(matchHiddenFromA);
  });

  it("get-match on a foreign club's match is a 404", async () => {
    const res = await get(`/api/match/${matchBB}`, { headers: memberA.headers });
    expect(res.status).toBe(404);
  });

  it("a participant of the cross-club match can see it", async () => {
    const res = await get(`/api/match/${matchAB}`, { headers: memberA.headers });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.match.id).toBe(matchAB);
  });

  it("match responses never carry personal data", async () => {
    const res = await get(`/api/match/${matchAB}`, { headers: memberA.headers });
    const raw = JSON.stringify(await res.json());
    expect(raw).not.toContain("email");
    expect(raw).not.toContain("phoneNumber");
    expect(raw).not.toContain("banReason");
  });

  it("liking a match you cannot see is a 404, not a notification", async () => {
    const res = await post(`/api/match/${matchBB}/like`, {}, { headers: memberA.headers });
    expect(res.status).toBe(404);
  });

  it("listing a foreign club's ranking is forbidden", async () => {
    const res = await get(`/api/leaderboard/organization/${b.orgId}`, { headers: memberA.headers });
    expect(res.status).toBe(403);
  });

  it("the platform-wide ranking is super-admin only", async () => {
    const asMember = await get("/api/leaderboard/global", { headers: memberA.headers });
    expect(asMember.status).toBe(403);
    const asAdmin = await get("/api/leaderboard/global", { headers: superAdmin.headers });
    expect(asAdmin.status).toBe(200);
  });

  it("the super-admin sees every club's matches", async () => {
    const res = await get("/api/match", {
      headers: superAdmin.headers,
      query: { organizationId: b.orgId },
    });
    expect(res.status).toBe(200);
  });

  it("create-match ignores a forged createdBy and requires the caller to be a participant", async () => {
    const now = new Date().toISOString();
    const forged = await post(
      "/api/match",
      {
        createdBy: memberB.id,
        status: "finished",
        createdAt: now,
        participants: [
          { userId: memberB.id, side: "home" },
          { userId: memberC.id, side: "away" },
        ],
      },
      { headers: memberA.headers },
    );
    expect(forged.status).toBe(403);

    const own = await post(
      "/api/match",
      {
        createdBy: memberA.id,
        status: "finished",
        createdAt: now,
        participants: [
          { userId: memberA.id, side: "home" },
          { userId: memberB.id, side: "away" },
        ],
      },
      { headers: memberA.headers },
    );
    expect(own.status).toBe(201);
    const body = await own.json();
    expect(body.match.createdBy).toBe(memberA.id);
    matchIds.push(body.match.id);
  });

  it("update-venue refuses a club none of the participants belong to", async () => {
    const res = await put(
      `/api/match/${matchAB}/venue`,
      { venueOrganizationId: c.orgId },
      { headers: memberA.headers },
    );
    expect(res.status).toBe(403);
  });
});
