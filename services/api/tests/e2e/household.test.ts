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
import { clubMemberProfile, household, member } from "../../db/schema";
import { eq } from "drizzle-orm";

describe("household domain (e2e)", () => {
  let ownerA: Awaited<ReturnType<typeof createTestUser>>;
  let ownerB: Awaited<ReturnType<typeof createTestUser>>;
  let kid: Awaited<ReturnType<typeof createTestUser>>;
  let outsider: Awaited<ReturnType<typeof createTestUser>>;
  let orgA: string;
  let orgB: string;

  beforeAll(async () => {
    ownerA = await createTestUser({ name: "Owner A" });
    ownerB = await createTestUser({ name: "Owner B" });
    kid = await createTestUser({ name: "Kid A" });
    outsider = await createTestUser({ name: "Outsider" });
    orgA = (await createTestOrganization(ownerA.user.id, { name: "Household A" })).organizationId;
    orgB = (await createTestOrganization(ownerB.user.id, { name: "Household B" })).organizationId;
    await db.insert(member).values({
      id: ulid(),
      userId: kid.user.id,
      organizationId: orgA,
      role: "member",
      createdAt: new Date(),
    });
  });

  afterAll(async () => {
    for (const orgId of [orgA, orgB]) {
      await db.delete(clubMemberProfile).where(eq(clubMemberProfile.organizationId, orgId));
      await db.delete(household).where(eq(household.organizationId, orgId));
      await cleanupTestOrganization(orgId);
    }
    for (const u of [ownerA, ownerB, kid, outsider]) await cleanupTestUser(u.user.id);
  });

  it("creates a household, assigns a member and lists it with its member count", async () => {
    const created = await post(
      "/api/household/create",
      { organizationId: orgA, name: "Famille Martin", payerUserId: ownerA.user.id, contactEmail: "Parent@Example.com" },
      { headers: ownerA.headers },
    );
    expect(created.status).toBe(201);
    const householdId = (await created.json()).household.id as string;

    const assign = await post(
      "/api/household/set-member-household",
      { organizationId: orgA, userId: kid.user.id, householdId },
      { headers: ownerA.headers },
    );
    expect(assign.status).toBe(200);

    const list = await get("/api/household/list", { headers: ownerA.headers, query: { organizationId: orgA } });
    const households = (await list.json()).households as { id: string; memberCount: number; contactEmail: string }[];
    const found = households.find((h) => h.id === householdId);
    expect(found?.memberCount).toBe(1);
    expect(found?.contactEmail).toBe("parent@example.com");
  });

  it("refuses a payer or member from another club", async () => {
    const badPayer = await post(
      "/api/household/create",
      { organizationId: orgA, name: "Bad payer", payerUserId: outsider.user.id },
      { headers: ownerA.headers },
    );
    expect(badPayer.status).toBe(400);

    const badMember = await post(
      "/api/household/create",
      { organizationId: orgA, name: "Bad member", memberUserIds: [outsider.user.id] },
      { headers: ownerA.headers },
    );
    expect(badMember.status).toBe(400);
  });

  it("does not let another club read or assign into this club's households", async () => {
    const [row] = await db.select().from(household).where(eq(household.organizationId, orgA)).limit(1);

    const detail = await get("/api/household/detail", {
      headers: ownerB.headers,
      query: { organizationId: orgB, householdId: row.id },
    });
    expect(detail.status).toBe(404);

    const forbidden = await get("/api/household/list", { headers: ownerB.headers, query: { organizationId: orgA } });
    expect(forbidden.status).toBe(403);

    const crossAssign = await post(
      "/api/household/set-member-household",
      { organizationId: orgB, userId: ownerB.user.id, householdId: row.id },
      { headers: ownerB.headers },
    );
    expect(crossAssign.status).toBe(404);
  });

  it("deleting a household keeps its members", async () => {
    const [row] = await db.select().from(household).where(eq(household.organizationId, orgA)).limit(1);
    const del = await post(
      "/api/household/delete",
      { organizationId: orgA, householdId: row.id },
      { headers: ownerA.headers },
    );
    expect(del.status).toBe(200);
    const [profile] = await db
      .select()
      .from(clubMemberProfile)
      .where(eq(clubMemberProfile.userId, kid.user.id))
      .limit(1);
    expect(profile?.householdId).toBeNull();
  });
});
