import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
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
import { user as userTable } from "../../db/schema/auth/schema";
import { match, matchParticipant } from "../../db/schema/match/schema";
import { matchIntent } from "../../db/schema/match_intents/schema";
import { EXACT_SEARCHES_PER_HOUR } from "../../lib/user-search";

/**
 * Phase 2, end-to-end cross-cutting scenarios. Each domain (match confirmation, conversation
 * requests, block/report, search, super-admin) already has its own dedicated e2e file
 * (match-confirmation, conversation-request, block-report, shareable-profile). This file does NOT
 * repeat those — it chains SEVERAL domains through the SAME users/state in single flows, which is
 * the only way to catch a regression that crosses domain boundaries (e.g. a club-access helper
 * change that breaks match visibility while every per-domain test still passes in isolation).
 */
describe("Phase 2 cross-cutting scenarios", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const matchIds: string[] = [];
  const intentIds: string[] = [];

  type Club = { orgId: string; ownerId: string; ownerHeaders: Headers };

  async function createClub(name: string): Promise<Club> {
    const owner = await createTestUser({ name: `${name} owner` });
    userIds.push(owner.user.id);
    const org = await createTestOrganization(owner.user.id, { name });
    orgIds.push(org.organizationId);
    return { orgId: org.organizationId, ownerId: owner.user.id, ownerHeaders: owner.headers };
  }

  function feedIds(body: { matches: Array<{ id: string }> }): string[] {
    return body.matches.map((m) => m.id);
  }

  // `createTestUser` doesn't hand the generated email back in the shape these tests need — read
  // it straight from the row instead.
  async function lookupEmail(userId: string): Promise<string> {
    const [row] = await db.select({ email: userTable.email }).from(userTable).where(eq(userTable.id, userId)).limit(1);
    return row.email;
  }

  let clubA: Club;
  let clubB: Club;
  let clubC: Club;
  let memberA: { id: string; headers: Headers };
  let memberB: { id: string; headers: Headers };
  let memberC: { id: string; headers: Headers };
  let sharedMatchId: string;

  beforeAll(async () => {
    clubA = await createClub("Cross A");
    clubB = await createClub("Cross B");
    clubC = await createClub("Cross C");
    memberA = { id: clubA.ownerId, headers: clubA.ownerHeaders };
    memberB = { id: clubB.ownerId, headers: clubB.ownerHeaders };
    memberC = { id: clubC.ownerId, headers: clubC.ownerHeaders };
  });

  afterAll(async () => {
    for (const id of intentIds) await db.delete(matchIntent).where(eq(matchIntent.id, id)).catch(() => {});
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId).catch(() => {});
    for (const userId of userIds) await cleanupTestUser(userId).catch(() => {});
  });

  it("a cross-club match stays participant-only until confirmed, then enters both club feeds but never a third club's", async () => {
    const now = new Date().toISOString();
    const created = await post(
      "/api/match",
      {
        createdBy: memberA.id,
        status: "finished",
        createdAt: now,
        startedAt: now,
        finishedAt: now,
        participants: [
          { userId: memberA.id, side: "home" },
          { userId: memberB.id, side: "away" },
        ],
      },
      { headers: memberA.headers },
    );
    expect(created.status).toBe(201);
    sharedMatchId = (await created.json()).match.id as string;
    matchIds.push(sharedMatchId);

    const feedABefore = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: clubA.orgId } })).json());
    const feedBBefore = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: clubB.orgId } })).json());
    expect(feedABefore).not.toContain(sharedMatchId);
    expect(feedBBefore).not.toContain(sharedMatchId);

    // Both participants always see their own match personally, confirmed or not.
    expect((await get(`/api/match/${sharedMatchId}`, { headers: memberA.headers })).status).toBe(200);
    expect((await get(`/api/match/${sharedMatchId}`, { headers: memberB.headers })).status).toBe(200);

    const confirm = await post(`/api/match/${sharedMatchId}/confirm`, {}, { headers: memberB.headers });
    expect(confirm.status).toBe(200);

    const feedAAfter = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: clubA.orgId } })).json());
    const feedBAfter = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: clubB.orgId } })).json());
    const feedCAfter = feedIds(await (await get("/api/match", { headers: memberC.headers, query: { organizationId: clubC.orgId } })).json());
    expect(feedAAfter).toContain(sharedMatchId);
    expect(feedBAfter).toContain(sharedMatchId);
    expect(feedCAfter).not.toContain(sharedMatchId);
  });

  it("player search never crosses clubs on a partial name, finds exactly one minimal result on an exact identifier, and rate-limits exact lookups", async () => {
    // Partial: B's owner name is never found by A on a name search (different clubs).
    const partial = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: "Cross B owner" },
    });
    expect((await partial.json()).users).toEqual([]);

    // Exact: A finds B's owner by email — one minimal result, no club/contact fields.
    const exact = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: (await lookupEmail(memberB.id)) },
    });
    const exactBody = await exact.json();
    expect(exactBody.users).toHaveLength(1);
    expect(exactBody.users[0].id).toBe(memberB.id);
    expect(exactBody.users[0]).not.toHaveProperty("organizationId");
    expect(exactBody.users[0]).not.toHaveProperty("email");

    // Rate limit: EXACT_SEARCHES_PER_HOUR exact lookups (already used one above) succeed, the next 429s.
    let lastStatus = 200;
    for (let i = 1; i < EXACT_SEARCHES_PER_HOUR; i++) {
      const res = await get("/api/user/search", {
        headers: memberA.headers,
        query: { query: `no-such-user-${i}-${ulid()}@example.com` },
      });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(200);
    const overLimit = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: `no-such-user-final-${ulid()}@example.com` },
    });
    expect(overLimit.status).toBe(429);
  });

  it("the first message between two players sharing no club, match or conversation starts as a request; the recipient's reply unlocks free exchange", async () => {
    const loneA = await createTestUser({ name: "Lone A" });
    userIds.push(loneA.user.id);
    const loneB = await createTestUser({ name: "Lone B" });
    userIds.push(loneB.user.id);

    const started = await post(
      "/api/conversation/find-or-create",
      { participantId: loneB.user.id },
      { headers: loneA.headers },
    );
    expect(started.status).toBe(201);
    const { conversationId, status } = await started.json();
    expect(status).toBe("pending_request");

    const first = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut, une partie ce week-end ?" },
      { headers: loneA.headers },
    );
    expect(first.status).toBe(201);

    const secondBeforeReply = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "T'es là ?" },
      { headers: loneA.headers },
    );
    expect(secondBeforeReply.status).toBe(400);

    const reply = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Avec plaisir !" },
      { headers: loneB.headers },
    );
    expect(reply.status).toBe(201);

    const freeExchange = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Samedi 10h ?" },
      { headers: loneA.headers },
    );
    expect(freeExchange.status).toBe(201);
  });

  it("blocking removes search, messaging and partner requests between the two sides without hiding a shared match from either participant; unblocking restores everything", async () => {
    // Reuses memberA/memberB and their now-confirmed shared match from the first scenario.
    const intentId = ulid();
    await db.insert(matchIntent).values({
      id: intentId,
      userId: memberA.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(intentId);

    // Baseline: B can request A's open intent before any block.
    const requestBefore = await post(`/api/match-intents/${intentId}/request`, {}, { headers: memberB.headers });
    expect(requestBefore.status).toBe(200);

    const block = await post("/api/user/block", { userId: memberB.id }, { headers: memberA.headers });
    expect(block.status).toBe(201);

    // Search: B is no longer found by A on an exact lookup.
    const searchAfterBlock = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: await lookupEmail(memberB.id) },
    });
    expect((await searchAfterBlock.json()).users).toEqual([]);

    // Messaging: refused in both directions.
    const messageAtoB = await post(
      "/api/conversation/find-or-create",
      { participantId: memberB.id },
      { headers: memberA.headers },
    );
    expect(messageAtoB.status).toBe(403);
    const messageBtoA = await post(
      "/api/conversation/find-or-create",
      { participantId: memberA.id },
      { headers: memberB.headers },
    );
    expect(messageBtoA.status).toBe(403);

    // Partner request: a fresh intent from A is now unreachable by B.
    const secondIntentId = ulid();
    await db.insert(matchIntent).values({
      id: secondIntentId,
      userId: memberA.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(secondIntentId);
    const requestAfterBlock = await post(`/api/match-intents/${secondIntentId}/request`, {}, { headers: memberB.headers });
    expect(requestAfterBlock.status).toBe(403);

    // The shared match stays visible to BOTH — blocking only hides a match from a non-participant
    // club-mate (covered by block-report.test.ts); it never hides a participant's own match.
    const feedAWhileBlocked = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: clubA.orgId } })).json());
    const feedBWhileBlocked = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: clubB.orgId } })).json());
    expect(feedAWhileBlocked).toContain(sharedMatchId);
    expect(feedBWhileBlocked).toContain(sharedMatchId);

    const unblock = await post("/api/user/unblock", { userId: memberB.id }, { headers: memberA.headers });
    expect(unblock.status).toBe(200);

    const searchAfterUnblock = await get("/api/user/search", {
      headers: memberA.headers,
      query: { query: await lookupEmail(memberB.id) },
    });
    expect((await searchAfterUnblock.json()).users.map((u: { id: string }) => u.id)).toContain(memberB.id);

    const messageAfterUnblock = await post(
      "/api/conversation/find-or-create",
      { participantId: memberB.id },
      { headers: memberA.headers },
    );
    expect(messageAfterUnblock.status).toBe(201);
  });

  it("the platform super-admin sees discovery, matches and search across every club without being a member of any", async () => {
    const admin = await createTestUser({ name: "Cross super admin", role: "admin" });
    userIds.push(admin.user.id);

    // Discovery: an intent owned by a member of club A, never joined by the admin.
    const adminIntentId = ulid();
    await db.insert(matchIntent).values({
      id: adminIntentId,
      userId: memberC.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(adminIntentId);
    const discover = await get("/api/match-intents/discover", { headers: admin.headers });
    expect(discover.status).toBe(200);
    const discoverIds = (await discover.json()).data.map((d: { id: string }) => d.id);
    expect(discoverIds).toContain(adminIntentId);

    // Matches: the admin reads club A's feed (containing the confirmed cross-club match) despite
    // never having been added as a member of club A.
    const adminFeed = await get("/api/match", { headers: admin.headers, query: { organizationId: clubA.orgId } });
    expect(adminFeed.status).toBe(200);
    expect(feedIds(await adminFeed.json())).toContain(sharedMatchId);

    // Search: unscoped, finds a club member by partial name with no club param at all.
    const adminSearch = await get("/api/user/search", { headers: admin.headers, query: { query: "Cross C owner" } });
    const adminSearchBody = await adminSearch.json();
    expect(adminSearchBody.users.map((u: { id: string }) => u.id)).toContain(memberC.id);
  });
});

