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
import { account, course, court, courtBooking, member, tarifGrid, tarifRule } from "../../db/schema";
import { and, eq, inArray } from "drizzle-orm";

interface ClubFixture {
  ownerId: string;
  ownerHeaders: Headers;
  coachId: string;
  orgId: string;
  courtId: string;
  courseId: string;
  bookingId: string;
}

async function createClub(label: string): Promise<ClubFixture> {
  const owner = await createTestUser({ name: `Owner ${label}` });
  const coach = await createTestUser({ name: `Coach ${label}` });
  const org = await createTestOrganization(owner.user.id, { name: `Club ${label}` });

  await db.insert(member).values({
    id: ulid(),
    userId: coach.user.id,
    organizationId: org.organizationId,
    role: "coach",
    createdAt: new Date(),
  });

  const [createdCourt] = await db
    .insert(court)
    .values({
      id: ulid(),
      organizationId: org.organizationId,
      name: `Court ${label}`,
      surface: "hard",
      indoor: false,
      isActive: true,
    })
    .returning();

  const now = new Date();
  const startAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0),
  );
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  const [createdCourse] = await db
    .insert(course)
    .values({
      id: ulid(),
      organizationId: org.organizationId,
      coachUserId: coach.user.id,
      courtId: createdCourt.id,
      name: `Cours ${label}`,
      weekday: startAt.getUTCDay(),
      startTime: "12:00",
      durationMinutes: 60,
      startDate: new Date(startAt.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(startAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();

  const [createdBooking] = await db
    .insert(courtBooking)
    .values({
      id: ulid(),
      courtId: createdCourt.id,
      userId: coach.user.id,
      startAt,
      endAt,
      status: "confirmed",
      kind: "course",
      courseId: createdCourse.id,
    })
    .returning();

  return {
    ownerId: owner.user.id,
    ownerHeaders: owner.headers,
    coachId: coach.user.id,
    orgId: org.organizationId,
    courtId: createdCourt.id,
    courseId: createdCourse.id,
    bookingId: createdBooking.id,
  };
}

async function destroyClub(club: ClubFixture) {
  await db.delete(courtBooking).where(eq(courtBooking.courtId, club.courtId));
  await db.delete(course).where(eq(course.id, club.courseId));
  await db.delete(court).where(eq(court.id, club.courtId));
  await cleanupTestOrganization(club.orgId);
  await cleanupTestUser(club.coachId);
  await cleanupTestUser(club.ownerId);
}

describe("Per-club isolation", () => {
  let clubA: ClubFixture;
  let clubB: ClubFixture;
  const extraUserIds: string[] = [];
  const gridIds: string[] = [];

  beforeAll(async () => {
    clubA = await createClub("A");
    clubB = await createClub("B");
  });

  afterAll(async () => {
    if (gridIds.length) {
      await db.delete(tarifRule).where(inArray(tarifRule.tarifGridId, gridIds));
      await db.delete(tarifGrid).where(inArray(tarifGrid.id, gridIds));
    }
    for (const id of extraUserIds) await cleanupTestUser(id);
    await destroyClub(clubA);
    await destroyClub(clubB);
  });

  describe("GET /api/club-dashboard/home", () => {
    it("only lists club A's coach and courses for club A", async () => {
      const res = await get("/api/club-dashboard/home", {
        headers: clubA.ownerHeaders,
        query: { organizationId: clubA.orgId },
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      const coachIds = data.coachBadges.map((b: { userId: string }) => b.userId);
      expect(coachIds).toContain(clubA.coachId);
      expect(coachIds).not.toContain(clubB.coachId);

      const courseIds = data.coursesToday.map((c: { courseId: string }) => c.courseId);
      expect(courseIds).toContain(clubA.courseId);
      expect(courseIds).not.toContain(clubB.courseId);
    });

    it("refuses club A's admin on club B's dashboard", async () => {
      const res = await get("/api/club-dashboard/home", {
        headers: clubA.ownerHeaders,
        query: { organizationId: clubB.orgId },
      });
      expect(res.status).toBe(403);
    });

    it("returns 401 without auth", async () => {
      const res = await get("/api/club-dashboard/home", { query: { organizationId: clubA.orgId } });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/court/search-members", () => {
    it("refuses a non-member searching another club's members", async () => {
      const res = await get("/api/court/search-members", {
        headers: clubA.ownerHeaders,
        query: { organizationId: clubB.orgId, query: "Coach" },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/club-member/add with an email that already exists", () => {
    it("adds the membership but never overwrites the existing password", async () => {
      const existing = await createTestUser({ name: "Existing Player" });
      extraUserIds.push(existing.user.id);

      const originalHash = "original-hash-must-not-change";
      await db.insert(account).values({
        id: ulid(),
        accountId: existing.user.id,
        providerId: "credential",
        userId: existing.user.id,
        password: originalHash,
        updatedAt: new Date(),
      });

      const res = await post(
        "/api/club-member/add",
        {
          organizationId: clubA.orgId,
          name: "Existing Player",
          email: existing.user.email,
          generatePassword: true,
        },
        { headers: clubA.ownerHeaders },
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.generatedPassword).toBeNull();

      const [row] = await db
        .select({ password: account.password })
        .from(account)
        .where(and(eq(account.userId, existing.user.id), eq(account.providerId, "credential")));
      expect(row.password).toBe(originalHash);
    });

    it("still generates a login for a brand-new ghost profile", async () => {
      const res = await post(
        "/api/club-member/add",
        {
          organizationId: clubA.orgId,
          name: "Brand New",
          email: `new-${ulid().toLowerCase()}@example.com`,
          generatePassword: true,
        },
        { headers: clubA.ownerHeaders },
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(typeof data.generatedPassword).toBe("string");
      extraUserIds.push(data.userId);
    });
  });

  describe("POST /api/pricing/rules/reorder across clubs", () => {
    async function createGrid(club: ClubFixture) {
      const id = ulid();
      await db.insert(tarifGrid).values({
        id,
        organizationId: club.orgId,
        familyId: id,
        seasonLabel: "2099-2100",
        seasonStartDate: new Date("2099-09-01T00:00:00Z"),
        seasonEndDate: new Date("2100-08-31T00:00:00Z"),
        createdByUserId: club.ownerId,
      });
      gridIds.push(id);
      return id;
    }

    it("does not change the sort order of another club's rule", async () => {
      const gridA = await createGrid(clubA);
      const gridB = await createGrid(clubB);

      const [ruleB] = await db
        .insert(tarifRule)
        .values({
          tarifGridId: gridB,
          name: "Regle B",
          conditions: [],
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "membership",
          sortOrder: 7,
        })
        .returning();

      const res = await post(
        "/api/pricing/rules/reorder",
        { gridId: gridA, orderedRuleIds: [ruleB.id] },
        { headers: clubA.ownerHeaders },
      );
      expect(res.status).toBe(200);

      const [after] = await db.select().from(tarifRule).where(eq(tarifRule.id, ruleB.id));
      expect(after.sortOrder).toBe(7);
    });

    it("refuses reordering a grid owned by another club", async () => {
      const gridB = await createGrid(clubB);
      const res = await post(
        "/api/pricing/rules/reorder",
        { gridId: gridB, orderedRuleIds: ["whatever"] },
        { headers: clubA.ownerHeaders },
      );
      expect(res.status).toBe(403);
    });
  });
});
