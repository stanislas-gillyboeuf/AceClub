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
import { match, matchParticipant } from "../../db/schema/match/schema";
import { ulid } from "ulid";

describe("Block and report between players", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const matchIds: string[] = [];

  // Club A: ownerA and carol play a match together; bob is a club-mate who only sees it via the
  // feed (not a participant) — the case block must hide it from, without hiding it from ownerA.
  let ownerA: { id: string; headers: Headers };
  let bob: { id: string; headers: Headers };
  let carol: { id: string; headers: Headers };
  let orgAId: string;
  let matchId: string;

  // A separate cross-club pair, purely for the exact-search block case.
  let danInA: { id: string; headers: Headers; email: string };
  let eveInB: { id: string; headers: Headers };
  let orgBId: string;

  beforeAll(async () => {
    const ownerAUser = await createTestUser({ name: "Block owner A" });
    userIds.push(ownerAUser.user.id);
    const orgA = await createTestOrganization(ownerAUser.user.id, { name: "Block Club A" });
    orgAId = orgA.organizationId;
    ownerA = { id: ownerAUser.user.id, headers: ownerAUser.headers };

    const bobUser = await createTestUser({ name: "Bob" });
    userIds.push(bobUser.user.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: bobUser.user.id,
      organizationId: orgAId,
      role: "member",
      createdAt: new Date(),
    });
    bob = { id: bobUser.user.id, headers: bobUser.headers };

    const carolUser = await createTestUser({ name: "Carol" });
    userIds.push(carolUser.user.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: carolUser.user.id,
      organizationId: orgAId,
      role: "member",
      createdAt: new Date(),
    });
    carol = { id: carolUser.user.id, headers: carolUser.headers };

    matchId = ulid();
    await db.insert(match).values({ id: matchId, createdBy: ownerA.id, status: "finished", createdAt: new Date() });
    await db.insert(matchParticipant).values([
      { id: ulid(), matchId, userId: ownerA.id, side: "home", confirmedAt: new Date() },
      { id: ulid(), matchId, userId: carol.id, side: "away", confirmedAt: new Date() },
    ]);
    matchIds.push(matchId);

    // Cross-club pair for the exact-search case.
    const danEmail = `block-dan-${ulid().toLowerCase()}@example.com`;
    const danUser = await createTestUser({ name: "Dan", email: danEmail });
    userIds.push(danUser.user.id);
    const orgB1 = await createTestOrganization(danUser.user.id, { name: "Block Club B1" });
    orgIds.push(orgB1.organizationId);
    danInA = { id: danUser.user.id, headers: danUser.headers, email: danEmail };

    const eveUser = await createTestUser({ name: "Eve" });
    userIds.push(eveUser.user.id);
    const orgB = await createTestOrganization(eveUser.user.id, { name: "Block Club B" });
    orgBId = orgB.organizationId;
    eveInB = { id: eveUser.user.id, headers: eveUser.headers };

    orgIds.push(orgAId, orgBId);
  });

  afterAll(async () => {
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId).catch(() => {});
    for (const userId of userIds) await cleanupTestUser(userId).catch(() => {});
  });

  it("bob blocks carol", async () => {
    const res = await post("/api/user/block", { userId: carol.id }, { headers: bob.headers });
    expect(res.status).toBe(201);

    const listed = await get("/api/user/blocked", { headers: bob.headers });
    const body = await listed.json();
    expect(body.users.map((u: { id: string }) => u.id)).toContain(carol.id);
  });

  it("hides a shared match from a blocked club-mate's feed, but never from its participant", async () => {
    const bobFeed = await get("/api/match", { headers: bob.headers, query: { organizationId: orgAId } });
    const bobIds = (await bobFeed.json()).data.map((m: { id: string }) => m.id);
    expect(bobIds).not.toContain(matchId);

    const ownerFeed = await get("/api/match", { headers: ownerA.headers, query: { organizationId: orgAId } });
    const ownerIds = (await ownerFeed.json()).data.map((m: { id: string }) => m.id);
    expect(ownerIds).toContain(matchId);
  });

  it("refuses find-or-create between blocked users", async () => {
    const res = await post(
      "/api/conversation/find-or-create",
      { participantId: carol.id },
      { headers: bob.headers },
    );
    expect(res.status).toBe(403);

    const reverse = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.id },
      { headers: carol.headers },
    );
    expect(reverse.status).toBe(403);
  });

  it("refuses an exact search across clubs once blocked", async () => {
    // Baseline: eve can find dan by exact email before any block.
    const before = await get("/api/user/search", { headers: eveInB.headers, query: { query: danInA.email } });
    expect((await before.json()).users.map((u: { id: string }) => u.id)).toContain(danInA.id);

    await post("/api/user/block", { userId: eveInB.id }, { headers: danInA.headers });

    const after = await get("/api/user/search", { headers: eveInB.headers, query: { query: danInA.email } });
    expect((await after.json()).users).toEqual([]);

    await post("/api/user/unblock", { userId: eveInB.id }, { headers: danInA.headers });
  });

  it("carol reports bob, visible to the super-admin", async () => {
    const admin = await createTestUser({ name: "Block super admin", role: "admin" });
    userIds.push(admin.user.id);

    const reported = await post(
      "/api/user/report",
      { userId: bob.id, reason: "Comportement déplacé", context: `match:${matchId}` },
      { headers: carol.headers },
    );
    expect(reported.status).toBe(201);
    const reportId = (await reported.json()).id;

    const list = await get("/api/admin/reports", { headers: admin.headers });
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.reports.some((r: { id: string; reported: { id: string } }) => r.id === reportId && r.reported.id === bob.id)).toBe(true);

    const updated = await put(`/api/admin/reports/${reportId}/status`, { status: "reviewed" }, { headers: admin.headers });
    expect(updated.status).toBe(200);
    expect((await updated.json()).status).toBe("reviewed");

    // A non-admin cannot list reports.
    const forbidden = await get("/api/admin/reports", { headers: bob.headers });
    expect(forbidden.status).toBe(403);
  });

  it("unblocking restores search and conversation access", async () => {
    await post("/api/user/unblock", { userId: carol.id }, { headers: bob.headers });

    const search = await get("/api/user/search", { headers: bob.headers, query: { query: "Carol" } });
    expect((await search.json()).users.map((u: { id: string }) => u.id)).toContain(carol.id);

    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: carol.id },
      { headers: bob.headers },
    );
    expect(found.status).toBe(201);
  });

  it("refuses self-block and self-report", async () => {
    const selfBlock = await post("/api/user/block", { userId: bob.id }, { headers: bob.headers });
    expect(selfBlock.status).toBe(400);

    const selfReport = await post(
      "/api/user/report",
      { userId: bob.id, reason: "test" },
      { headers: bob.headers },
    );
    expect(selfReport.status).toBe(400);
  });
});
