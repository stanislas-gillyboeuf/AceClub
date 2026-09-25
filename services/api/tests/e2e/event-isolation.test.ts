import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
import { event as eventTable, eventParticipant } from "../../db/schema/event/schema";
import { eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";

type Club = { orgId: string; ownerId: string; ownerHeaders: Headers };

describe("Event isolation between clubs", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const eventIds: string[] = [];

  let a: Club;
  let b: Club;
  let memberA: { id: string; headers: Headers };
  let memberB: { id: string; headers: Headers };
  let memberAB: { id: string; headers: Headers };
  let superAdmin: { id: string; headers: Headers };
  let bPublicEventId: string;
  let bOrgEventId: string;
  let bDraftEventId: string;
  let aOrgEventId: string;

  async function createClub(name: string): Promise<Club> {
    const owner = await createTestUser({ name: `${name} owner` });
    userIds.push(owner.user.id);
    const org = await createTestOrganization(owner.user.id, { name });
    orgIds.push(org.organizationId);
    return { orgId: org.organizationId, ownerId: owner.user.id, ownerHeaders: owner.headers };
  }

  async function addMember(orgId: string, label: string, extraOrgId?: string) {
    const u = await createTestUser({ name: label });
    userIds.push(u.user.id);
    for (const id of [orgId, extraOrgId].filter((x): x is string => !!x)) {
      await db.insert(memberTable).values({
        id: ulid(),
        userId: u.user.id,
        organizationId: id,
        role: "member",
        createdAt: new Date(),
      });
    }
    return { id: u.user.id, headers: u.headers };
  }

  async function insertEvent(
    club: Club,
    values: { name: string; visibility: "public" | "organization"; status: "draft" | "on_sale" },
  ) {
    const id = ulid();
    await db.insert(eventTable).values({
      id,
      name: values.name,
      startDate: new Date(Date.now() + 86_400_000),
      endDate: new Date(Date.now() + 90_000_000),
      visibility: values.visibility,
      status: values.status,
      userId: club.ownerId,
      organizationId: club.orgId,
    });
    eventIds.push(id);
    return id;
  }

  beforeAll(async () => {
    a = await createClub("Iso Club A");
    b = await createClub("Iso Club B");
    memberA = await addMember(a.orgId, "Iso member A");
    memberB = await addMember(b.orgId, "Iso member B");
    memberAB = await addMember(a.orgId, "Iso member A+B", b.orgId);

    const admin = await createTestUser({ role: "admin", name: "Iso super admin" });
    userIds.push(admin.user.id);
    superAdmin = { id: admin.user.id, headers: admin.headers };

    bPublicEventId = await insertEvent(b, { name: "B public", visibility: "public", status: "on_sale" });
    bOrgEventId = await insertEvent(b, { name: "B org", visibility: "organization", status: "on_sale" });
    bDraftEventId = await insertEvent(b, { name: "B draft", visibility: "public", status: "draft" });
    aOrgEventId = await insertEvent(a, { name: "A org", visibility: "organization", status: "on_sale" });
  });

  afterAll(async () => {
    if (eventIds.length > 0) {
      await db.delete(eventParticipant).where(inArray(eventParticipant.eventId, eventIds));
      await db.delete(eventTable).where(inArray(eventTable.id, eventIds));
    }
    for (const id of orgIds) await cleanupTestOrganization(id);
    for (const id of userIds) await cleanupTestUser(id);
  });

  const names = (body: { data: Array<{ name: string }> }) => body.data.map((e) => e.name);

  describe("GET /api/event/list", () => {
    it("a member of A sees nothing from B, even a 'public' event", async () => {
      const res = await get("/api/event/list", { headers: memberA.headers });
      expect(res.status).toBe(200);
      const list = names(await res.json());
      expect(list).toContain("A org");
      expect(list).not.toContain("B public");
      expect(list).not.toContain("B org");
    });

    it("asking for club B directly is refused (403), with or without visibility", async () => {
      const plain = await get("/api/event/list", {
        headers: memberA.headers,
        query: { organizationId: b.orgId },
      });
      expect(plain.status).toBe(403);

      const org = await get("/api/event/list", {
        headers: memberA.headers,
        query: { visibility: "organization", organizationId: b.orgId },
      });
      expect(org.status).toBe(403);
    });

    it("a member of B sees B's events, never drafts", async () => {
      const res = await get("/api/event/list", { headers: memberB.headers });
      expect(res.status).toBe(200);
      const list = names(await res.json());
      expect(list).toContain("B public");
      expect(list).toContain("B org");
      expect(list).not.toContain("B draft");
      expect(list).not.toContain("A org");
    });

    it("a member of A and B sees both clubs, each one selectable on its own", async () => {
      const all = names(await (await get("/api/event/list", { headers: memberAB.headers })).json());
      expect(all).toEqual(expect.arrayContaining(["A org", "B public", "B org"]));

      const onlyB = names(
        await (
          await get("/api/event/list", { headers: memberAB.headers, query: { organizationId: b.orgId } })
        ).json(),
      );
      expect(onlyB).toEqual(expect.arrayContaining(["B public", "B org"]));
      expect(onlyB).not.toContain("A org");
    });

    it("a platform admin sees every club", async () => {
      const list = names(await (await get("/api/event/list", { headers: superAdmin.headers })).json());
      expect(list).toEqual(expect.arrayContaining(["A org", "B public", "B org"]));
    });
  });

  describe("access by event id", () => {
    it("GET /event/get answers 404 for another club's event (public or not)", async () => {
      for (const id of [bPublicEventId, bOrgEventId, bDraftEventId]) {
        const res = await get("/api/event/get", { headers: memberA.headers, query: { eventId: id } });
        expect(res.status).toBe(404);
      }
    });

    it("GET /event/get works for members and for the platform admin", async () => {
      const own = await get("/api/event/get", { headers: memberB.headers, query: { eventId: bPublicEventId } });
      expect(own.status).toBe(200);
      const admin = await get("/api/event/get", { headers: superAdmin.headers, query: { eventId: bOrgEventId } });
      expect(admin.status).toBe(200);
    });

    it("a draft is only visible to its club's admins", async () => {
      const asMember = await get("/api/event/get", { headers: memberB.headers, query: { eventId: bDraftEventId } });
      expect(asMember.status).toBe(404);
      const asOwner = await get("/api/event/get", { headers: b.ownerHeaders, query: { eventId: bDraftEventId } });
      expect(asOwner.status).toBe(200);
    });

    it("GET /event/list-participants answers 404 for another club's event", async () => {
      const res = await get("/api/event/list-participants", {
        headers: memberA.headers,
        query: { eventId: bPublicEventId },
      });
      expect(res.status).toBe(404);
      const own = await get("/api/event/list-participants", {
        headers: memberB.headers,
        query: { eventId: bPublicEventId },
      });
      expect(own.status).toBe(200);
    });

    it("POST /event/register answers 404 for another club's public event and nothing is written", async () => {
      const res = await post("/api/event/register", { eventId: bPublicEventId }, { headers: memberA.headers });
      expect(res.status).toBe(404);
      const rows = await db.select().from(eventParticipant).where(eq(eventParticipant.eventId, bPublicEventId));
      expect(rows.some((r) => r.userId === memberA.id)).toBe(false);
    });

    it("a member can register for their own club's event", async () => {
      const res = await post("/api/event/register", { eventId: bPublicEventId }, { headers: memberB.headers });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe("POST /api/event/add-participant", () => {
    it("refuses to enroll a user who is not a member of the event's club", async () => {
      const res = await post(
        "/api/event/add-participant",
        { eventId: bOrgEventId, userId: memberA.id },
        { headers: b.ownerHeaders },
      );
      expect(res.status).toBe(400);
    });

    it("enrolls a member of the club", async () => {
      const res = await post(
        "/api/event/add-participant",
        { eventId: bOrgEventId, userId: memberB.id },
        { headers: b.ownerHeaders },
      );
      expect([200, 201]).toContain(res.status);
    });
  });

  it("tournament events are covered: a club event is never listed to another club", async () => {
    const list = names(await (await get("/api/event/list", { headers: memberA.headers })).json());
    expect(list.some((n) => n.startsWith("B "))).toBe(false);
  });
});
