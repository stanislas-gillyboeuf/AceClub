import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  post,
  get,
  db,
} from "../helpers";
import { conversation } from "../../db/schema/conversation/schema";
import { member as memberTable } from "../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

describe("conversation requests between unlinked players", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;
  let orgA: { organizationId: string };
  let orgB: { organizationId: string };

  // Same-club pair — should never go through the request flow.
  let carla: Awaited<ReturnType<typeof createTestUser>>;
  let dave: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    alice = await createTestUser({ name: "Alice" });
    bob = await createTestUser({ name: "Bob" });
    carla = await createTestUser({ name: "Carla" });
    dave = await createTestUser({ name: "Dave" });

    orgA = await createTestOrganization(alice.user.id, { name: "Club A" });
    orgB = await createTestOrganization(bob.user.id, { name: "Club B" });

    // Carla and Dave share club A.
    await db.insert(memberTable).values({
      id: `${orgA.organizationId}-dave`,
      userId: dave.user.id,
      organizationId: orgA.organizationId,
      role: "member",
      createdAt: new Date(),
    });
    await db.insert(memberTable).values({
      id: `${orgA.organizationId}-carla`,
      userId: carla.user.id,
      organizationId: orgA.organizationId,
      role: "member",
      createdAt: new Date(),
    });
  });

  afterAll(async () => {
    await cleanupTestOrganization(orgA.organizationId);
    await cleanupTestOrganization(orgB.organizationId);
    await cleanupTestUser(alice.user.id);
    await cleanupTestUser(bob.user.id);
    await cleanupTestUser(carla.user.id);
    await cleanupTestUser(dave.user.id);
  });

  it("starts a request when the two players share no club, match or conversation", async () => {
    const res = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe("pending_request");
    expect(body.created).toBe(true);
  });

  it("allows the initiator's one message but refuses a second one", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();

    const first = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut, ça te dit un match ?" },
      { headers: alice.headers },
    );
    expect(first.status).toBe(201);

    const second = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "T'es là ?" },
      { headers: alice.headers },
    );
    expect(second.status).toBe(400);

    const [row] = await db
      .select({ status: conversation.status })
      .from(conversation)
      .where(eq(conversation.id, conversationId));
    expect(row.status).toBe("pending_request");
  });

  it("the recipient's reply implicitly accepts the request, unlocking free exchange", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();

    await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut !" },
      { headers: alice.headers },
    );

    const reply = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut, avec plaisir !" },
      { headers: bob.headers },
    );
    expect(reply.status).toBe(201);

    const [row] = await db
      .select({ status: conversation.status })
      .from(conversation)
      .where(eq(conversation.id, conversationId));
    expect(row.status).toBe("active");

    // Alice can now send freely.
    const followUp = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Super, samedi ?" },
      { headers: alice.headers },
    );
    expect(followUp.status).toBe(201);
  });

  it("explicit rejection blocks the initiator from writing again", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();

    await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut !" },
      { headers: alice.headers },
    );

    const rejected = await post(
      `/api/conversation/${conversationId}/reject-request`,
      {},
      { headers: bob.headers },
    );
    expect(rejected.status).toBe(200);
    const rejectedBody = await rejected.json();
    expect(rejectedBody.status).toBe("rejected");

    const blocked = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Alors ?" },
      { headers: alice.headers },
    );
    expect(blocked.status).toBe(400);
  });

  it("an explicit accept also unlocks the conversation without waiting for a reply", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();

    const accepted = await post(
      `/api/conversation/${conversationId}/accept-request`,
      {},
      { headers: bob.headers },
    );
    expect(accepted.status).toBe(200);
    const acceptedBody = await accepted.json();
    expect(acceptedBody.status).toBe("active");

    // Alice can now send more than one message right away.
    await post(
      `/api/conversation/${conversationId}/message`,
      { content: "1" },
      { headers: alice.headers },
    );
    const secondAfterAccept = await post(
      `/api/conversation/${conversationId}/message`,
      { content: "2" },
      { headers: alice.headers },
    );
    expect(secondAfterAccept.status).toBe(201);
  });

  it("two members of the same club start an active conversation immediately", async () => {
    const res = await post(
      "/api/conversation/find-or-create",
      { participantId: dave.user.id },
      { headers: carla.headers },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe("active");

    // Both can message freely from the start — no request gate.
    const first = await post(
      `/api/conversation/${body.conversationId}/message`,
      { content: "Salut !" },
      { headers: carla.headers },
    );
    expect(first.status).toBe(201);
    const second = await post(
      `/api/conversation/${body.conversationId}/message`,
      { content: "Encore un message" },
      { headers: carla.headers },
    );
    expect(second.status).toBe(201);
  });

  it("list-conversations exposes the status so the client can build a Requests section", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();
    await post(
      `/api/conversation/${conversationId}/message`,
      { content: "Salut" },
      { headers: alice.headers },
    );

    const list = await get("/api/conversation", { headers: bob.headers });
    expect(list.status).toBe(200);
    const conversations = await list.json();
    const pending = conversations.find((c: { id: string }) => c.id === conversationId);
    expect(pending?.status).toBe("pending_request");
    expect(pending?.initiatedByUserId).toBe(alice.user.id);
  });

  it("only the recipient may accept or reject, never the initiator", async () => {
    const found = await post(
      "/api/conversation/find-or-create",
      { participantId: bob.user.id },
      { headers: alice.headers },
    );
    const { conversationId } = await found.json();

    const selfAccept = await post(
      `/api/conversation/${conversationId}/accept-request`,
      {},
      { headers: alice.headers },
    );
    expect(selfAccept.status).toBe(400);

    const selfReject = await post(
      `/api/conversation/${conversationId}/reject-request`,
      {},
      { headers: alice.headers },
    );
    expect(selfReject.status).toBe(400);
  });
});
