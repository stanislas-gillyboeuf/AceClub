import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { createTestUser, cleanupTestUser, get, post, db } from "../helpers";
import { match, matchParticipant } from "../../db/schema/match/schema";
import { conversation, conversationParticipant } from "../../db/schema/conversation/schema";

describe("Shareable profile link and past partners", () => {
  const userIds: string[] = [];
  const matchIds: string[] = [];
  const conversationIds: string[] = [];

  let alice: { id: string; headers: Headers };
  let bob: { id: string; headers: Headers };
  let carol: { id: string; headers: Headers };

  beforeAll(async () => {
    const aliceUser = await createTestUser({ name: "Alice" });
    userIds.push(aliceUser.user.id);
    alice = { id: aliceUser.user.id, headers: aliceUser.headers };

    const bobUser = await createTestUser({ name: "Bob" });
    userIds.push(bobUser.user.id);
    bob = { id: bobUser.user.id, headers: bobUser.headers };

    const carolUser = await createTestUser({ name: "Carol" });
    userIds.push(carolUser.user.id);
    carol = { id: carolUser.user.id, headers: carolUser.headers };

    // Alice and Bob share a finished match — no clubs involved, a pure direct relation.
    const matchId = ulid();
    await db
      .insert(match)
      .values({ id: matchId, createdBy: alice.id, status: "finished", createdAt: new Date() });
    await db.insert(matchParticipant).values([
      { id: ulid(), matchId, userId: alice.id, side: "home", confirmedAt: new Date() },
      { id: ulid(), matchId, userId: bob.id, side: "away", confirmedAt: new Date() },
    ]);
    matchIds.push(matchId);

    // Alice and Carol have an active direct conversation.
    const conversationId = ulid();
    await db.insert(conversation).values({
      id: conversationId,
      type: "direct",
      status: "active",
      lastMessageAt: new Date(),
    });
    await db.insert(conversationParticipant).values([
      { id: ulid(), conversationId, userId: alice.id, joinedAt: new Date() },
      { id: ulid(), conversationId, userId: carol.id, joinedAt: new Date() },
    ]);
    conversationIds.push(conversationId);
  });

  afterAll(async () => {
    await db.delete(conversationParticipant).catch(() => {});
    for (const id of conversationIds) await db.delete(conversation).where(eq(conversation.id, id)).catch(() => {});
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const userId of userIds) await cleanupTestUser(userId).catch(() => {});
  });

  it("creates a token, resolves it to the minimal profile, and revoking it 404s afterward", async () => {
    const created = await post("/api/user/profile-share-token/create", {}, { headers: bob.headers });
    expect(created.status).toBe(201);
    const { token, deepLink } = await created.json();
    expect(typeof token).toBe("string");
    expect(deepLink).toBe(`aceclub://profile/${token}`);

    const resolved = await get("/api/user/profile-by-token", { headers: alice.headers, query: { token } });
    expect(resolved.status).toBe(200);
    const profile = await resolved.json();
    expect(profile).toEqual({ id: bob.id, name: "Bob", image: null, skillLevel: null });
    // Never the club or contact details.
    expect(profile).not.toHaveProperty("email");
    expect(profile).not.toHaveProperty("organizationId");

    const revoked = await post(
      "/api/user/profile-share-token/revoke",
      { token },
      { headers: bob.headers },
    );
    expect(revoked.status).toBe(200);

    const afterRevoke = await get("/api/user/profile-by-token", {
      headers: alice.headers,
      query: { token },
    });
    expect(afterRevoke.status).toBe(404);
  });

  it("an unknown token 404s, indistinguishable from a revoked one", async () => {
    const res = await get("/api/user/profile-by-token", {
      headers: alice.headers,
      query: { token: "does-not-exist" },
    });
    expect(res.status).toBe(404);
  });

  it("a token from a profile that has blocked the viewer 404s", async () => {
    const created = await post("/api/user/profile-share-token/create", {}, { headers: carol.headers });
    const { token } = await created.json();

    await post("/api/user/block", { userId: bob.id }, { headers: carol.headers });

    const res = await get("/api/user/profile-by-token", { headers: bob.headers, query: { token } });
    expect(res.status).toBe(404);

    await post("/api/user/unblock", { userId: bob.id }, { headers: carol.headers });
  });

  it("lists past partners across matches and active direct conversations, excluding blocked users", async () => {
    const res = await get("/api/user/past-partners", { headers: alice.headers });
    expect(res.status).toBe(200);
    const { partners } = await res.json();
    const ids = partners.map((p: { id: string }) => p.id);
    expect(ids).toContain(bob.id);
    expect(ids).toContain(carol.id);

    await post("/api/user/block", { userId: bob.id }, { headers: alice.headers });
    const afterBlock = await get("/api/user/past-partners", { headers: alice.headers });
    const idsAfterBlock = (await afterBlock.json()).partners.map((p: { id: string }) => p.id);
    expect(idsAfterBlock).not.toContain(bob.id);
    expect(idsAfterBlock).toContain(carol.id);

    await post("/api/user/unblock", { userId: bob.id }, { headers: alice.headers });
  });
});
