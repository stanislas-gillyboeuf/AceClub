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
import { member as memberTable } from "../../db/schema/auth/schema";
import { match, matchParticipant } from "../../db/schema/match/schema";
import { matchIntent, matchRequest } from "../../db/schema/match_intents/schema";
import { CONFIRMATION_WINDOW_MS } from "../../server/match/lib/confirmation";
import { ulid } from "ulid";

type Club = { orgId: string; ownerId: string; ownerHeaders: Headers };

describe("Cross-club matches require participant confirmation before entering feeds", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const matchIds: string[] = [];
  const intentIds: string[] = [];

  let a: Club;
  let b: Club;
  let c: Club;
  let memberA: { id: string; headers: Headers };
  let memberB: { id: string; headers: Headers };
  let memberC: { id: string; headers: Headers };

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

  function feedIds(body: { matches: Array<{ id: string }> }): string[] {
    return body.matches.map((m) => m.id);
  }

  beforeAll(async () => {
    a = await createClub("Confirm Club A");
    b = await createClub("Confirm Club B");
    c = await createClub("Confirm Club C");
    memberA = await addMember(a, "Confirm member A");
    memberB = await addMember(b, "Confirm member B");
    memberC = await addMember(c, "Confirm member C");
  });

  afterAll(async () => {
    await db.delete(matchRequest).catch(() => {});
    for (const id of intentIds) await db.delete(matchIntent).where(eq(matchIntent.id, id)).catch(() => {});
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId);
    for (const userId of userIds) await cleanupTestUser(userId);
  });

  it("a match created between two clubs is invisible in either feed until the invited player confirms", async () => {
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
    const matchId = (await created.json()).match.id as string;
    matchIds.push(matchId);

    const feedA = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: a.orgId } })).json());
    const feedB = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: b.orgId } })).json());
    expect(feedA).not.toContain(matchId);
    expect(feedB).not.toContain(matchId);

    // The creator (self-added) always sees their own match personally, confirmed or not.
    const ownView = await get(`/api/match/${matchId}`, { headers: memberA.headers });
    expect(ownView.status).toBe(200);

    // The invited participant (memberB) confirms.
    const confirmAsWrongPerson = await post(`/api/match/${matchId}/confirm`, {}, { headers: memberC.headers });
    expect(confirmAsWrongPerson.status).toBe(404);

    const confirm = await post(`/api/match/${matchId}/confirm`, {}, { headers: memberB.headers });
    expect(confirm.status).toBe(200);
    expect((await confirm.json()).alreadyConfirmed).toBe(false);

    // Idempotent: confirming again just succeeds.
    const confirmAgain = await post(`/api/match/${matchId}/confirm`, {}, { headers: memberB.headers });
    expect(confirmAgain.status).toBe(200);
    expect((await confirmAgain.json()).alreadyConfirmed).toBe(true);

    const feedAAfter = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: a.orgId } })).json());
    const feedBAfter = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: b.orgId } })).json());
    const feedCAfter = feedIds(await (await get("/api/match", { headers: memberC.headers, query: { organizationId: c.orgId } })).json());
    expect(feedAAfter).toContain(matchId);
    expect(feedBAfter).toContain(matchId);
    expect(feedCAfter).not.toContain(matchId);
  });

  it("a match born from an already-accepted partner request is visible immediately, no extra confirmation needed", async () => {
    const intentId = ulid();
    await db.insert(matchIntent).values({
      id: intentId,
      userId: memberA.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(intentId);

    const requestId = ulid();
    await db.insert(matchRequest).values({
      id: requestId,
      matchIntentId: intentId,
      requesterId: memberB.id,
      receiverId: memberA.id,
      status: "pending",
    });

    const accept = await post(`/api/match-intents/requests/${requestId}/accept`, {}, { headers: memberA.headers });
    expect(accept.status).toBe(200);
    const matchId = (await accept.json()).match.id as string;
    matchIds.push(matchId);

    const feedA = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: a.orgId } })).json());
    const feedB = feedIds(await (await get("/api/match", { headers: memberB.headers, query: { organizationId: b.orgId } })).json());
    expect(feedA).toContain(matchId);
    expect(feedB).toContain(matchId);
  });

  it("past the 7-day window, confirmation is refused and the match remains participant-only forever", async () => {
    const oldCreatedAt = new Date(Date.now() - CONFIRMATION_WINDOW_MS - 24 * 60 * 60 * 1000);
    const matchId = ulid();
    await db.insert(match).values({
      id: matchId,
      createdBy: memberA.id,
      status: "finished",
      createdAt: oldCreatedAt,
      startedAt: oldCreatedAt,
      finishedAt: oldCreatedAt,
    });
    await db.insert(matchParticipant).values([
      { id: ulid(), matchId, userId: memberA.id, side: "home", confirmedAt: oldCreatedAt },
      { id: ulid(), matchId, userId: memberB.id, side: "away", confirmedAt: null },
    ]);
    matchIds.push(matchId);

    const confirm = await post(`/api/match/${matchId}/confirm`, {}, { headers: memberB.headers });
    expect(confirm.status).toBe(400);

    const feedA = feedIds(await (await get("/api/match", { headers: memberA.headers, query: { organizationId: a.orgId } })).json());
    expect(feedA).not.toContain(matchId);

    // Participants can still always see it themselves.
    const ownView = await get(`/api/match/${matchId}`, { headers: memberB.headers });
    expect(ownView.status).toBe(200);
  });
});
