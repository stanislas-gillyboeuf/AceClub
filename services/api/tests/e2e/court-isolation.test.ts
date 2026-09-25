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
import {
  course,
  courseEnrollment,
  court,
  courtBooking,
  courtBookingParticipant,
  member,
} from "../../db/schema";
import { and, eq } from "drizzle-orm";

function tomorrowDate(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

interface ClubFixture {
  orgId: string;
  ownerId: string;
  ownerHeaders: Headers;
  memberId: string;
  memberHeaders: Headers;
  coachId: string;
  coachHeaders: Headers;
  openPadelCourtId: string;
  membersOnlyCourtId: string;
  padelBookingId: string;
  courseId: string;
  courseBookingId: string;
}

async function addMember(userId: string, organizationId: string, role: string) {
  await db.insert(member).values({
    id: ulid(),
    userId,
    organizationId,
    role,
    createdAt: new Date(),
  });
}

async function createClub(label: string): Promise<ClubFixture> {
  const owner = await createTestUser({ name: `Owner ${label}` });
  const regular = await createTestUser({ name: `Member ${label}` });
  const coach = await createTestUser({ name: `Coach ${label}` });
  const org = await createTestOrganization(owner.user.id, { name: `Court club ${label}` });
  await addMember(regular.user.id, org.organizationId, "member");
  await addMember(coach.user.id, org.organizationId, "coach");

  const [openPadel] = await db
    .insert(court)
    .values({
      id: ulid(),
      organizationId: org.organizationId,
      name: `Padel ${label}`,
      sport: "padel",
      surface: "hard",
      indoor: false,
      isActive: true,
      accessPolicy: "open",
    })
    .returning();
  const [membersOnly] = await db
    .insert(court)
    .values({
      id: ulid(),
      organizationId: org.organizationId,
      name: `Tennis ${label}`,
      sport: "tennis",
      surface: "clay",
      indoor: false,
      isActive: true,
      accessPolicy: "members_only",
    })
    .returning();

  const day = new Date(`${tomorrowDate()}T00:00:00.000Z`);
  const slot = (hour: number) => ({
    startAt: new Date(day.getTime() + hour * 60 * 60 * 1000),
    endAt: new Date(day.getTime() + (hour + 1) * 60 * 60 * 1000),
  });

  const [padelBooking] = await db
    .insert(courtBooking)
    .values({
      id: ulid(),
      courtId: openPadel.id,
      userId: owner.user.id,
      ...slot(15),
      status: "confirmed",
    })
    .returning();

  const [createdCourse] = await db
    .insert(course)
    .values({
      id: ulid(),
      organizationId: org.organizationId,
      coachUserId: coach.user.id,
      courtId: membersOnly.id,
      name: `Cours ${label}`,
      weekday: day.getUTCDay(),
      startTime: "17:00",
      durationMinutes: 60,
      startDate: new Date(day.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(day.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();
  await db.insert(courseEnrollment).values({
    id: ulid(),
    courseId: createdCourse.id,
    userId: regular.user.id,
  });
  const [courseBooking] = await db
    .insert(courtBooking)
    .values({
      id: ulid(),
      courtId: membersOnly.id,
      userId: coach.user.id,
      ...slot(17),
      status: "confirmed",
      kind: "course",
      courseId: createdCourse.id,
    })
    .returning();

  return {
    orgId: org.organizationId,
    ownerId: owner.user.id,
    ownerHeaders: owner.headers,
    memberId: regular.user.id,
    memberHeaders: regular.headers,
    coachId: coach.user.id,
    coachHeaders: coach.headers,
    openPadelCourtId: openPadel.id,
    membersOnlyCourtId: membersOnly.id,
    padelBookingId: padelBooking.id,
    courseId: createdCourse.id,
    courseBookingId: courseBooking.id,
  };
}

async function destroyClub(club: ClubFixture) {
  for (const courtId of [club.openPadelCourtId, club.membersOnlyCourtId]) {
    const bookings = await db.select({ id: courtBooking.id }).from(courtBooking).where(eq(courtBooking.courtId, courtId));
    for (const b of bookings) {
      await db.delete(courtBookingParticipant).where(eq(courtBookingParticipant.bookingId, b.id));
    }
    await db.delete(courtBooking).where(eq(courtBooking.courtId, courtId));
  }
  await db.delete(courseEnrollment).where(eq(courseEnrollment.courseId, club.courseId));
  await db.delete(course).where(eq(course.id, club.courseId));
  await db.delete(court).where(eq(court.id, club.openPadelCourtId));
  await db.delete(court).where(eq(court.id, club.membersOnlyCourtId));
  await cleanupTestOrganization(club.orgId);
  await cleanupTestUser(club.coachId);
  await cleanupTestUser(club.memberId);
  await cleanupTestUser(club.ownerId);
}

describe("Courts, courses and tags are only reachable by members of the club", () => {
  let clubA: ClubFixture;
  let clubB: ClubFixture;
  let multi: { id: string; headers: Headers };
  let superAdmin: { id: string; headers: Headers };

  beforeAll(async () => {
    clubA = await createClub("A");
    clubB = await createClub("B");

    const both = await createTestUser({ name: "Member of A and B" });
    multi = { id: both.user.id, headers: both.headers };
    await addMember(both.user.id, clubA.orgId, "member");
    await addMember(both.user.id, clubB.orgId, "member");

    const admin = await createTestUser({ name: "Super admin", role: "admin" });
    superAdmin = { id: admin.user.id, headers: admin.headers };
  });

  afterAll(async () => {
    await db.delete(member).where(eq(member.userId, multi.id));
    await cleanupTestUser(multi.id);
    await cleanupTestUser(superAdmin.id);
    await destroyClub(clubA);
    await destroyClub(clubB);
  });

  describe("club-scoped reads", () => {
    it("lets a member read their own club", async () => {
      const res = await get("/api/court/list", {
        headers: clubA.memberHeaders,
        query: { organizationId: clubA.orgId },
      });
      expect(res.status).toBe(200);
      const ids = (await res.json()).map((c: { id: string }) => c.id);
      expect(ids).toContain(clubA.openPadelCourtId);
      expect(ids).not.toContain(clubB.openPadelCourtId);
    });

    it.each([
      ["/api/court/list", {}],
      ["/api/court/settings", {}],
      ["/api/court/my-weekly-quota", {}],
      ["/api/court/booking-enabled", {}],
      ["/api/court/board", { sport: "padel", date: tomorrowDate() }],
    ])("refuses %s for a member of another club", async (path, extra) => {
      const res = await get(path, {
        headers: clubA.memberHeaders,
        query: { organizationId: clubB.orgId, ...extra },
      });
      expect(res.status).toBe(403);
    });

    it("hides another club's court availability, even for an open court", async () => {
      const res = await get("/api/court/availability", {
        headers: clubA.memberHeaders,
        query: { courtId: clubB.openPadelCourtId, date: tomorrowDate() },
      });
      expect(res.status).toBe(404);
    });

    it("answers 404 for a booking of another club", async () => {
      const res = await get(`/api/court/booking/${clubB.padelBookingId}`, {
        headers: clubA.memberHeaders,
      });
      expect(res.status).toBe(404);
    });

    it("lets the booker and the club admin read a booking", async () => {
      const own = await get(`/api/court/booking/${clubA.padelBookingId}`, { headers: clubA.ownerHeaders });
      expect(own.status).toBe(200);
    });

    it("shows a member of A and B both clubs, never mixed", async () => {
      const a = await get("/api/court/list", { headers: multi.headers, query: { organizationId: clubA.orgId } });
      const b = await get("/api/court/list", { headers: multi.headers, query: { organizationId: clubB.orgId } });
      expect(a.status).toBe(200);
      expect(b.status).toBe(200);
      const idsA = (await a.json()).map((c: { id: string }) => c.id);
      const idsB = (await b.json()).map((c: { id: string }) => c.id);
      expect(idsA).toContain(clubA.openPadelCourtId);
      expect(idsA).not.toContain(clubB.openPadelCourtId);
      expect(idsB).toContain(clubB.openPadelCourtId);
      expect(idsB).not.toContain(clubA.openPadelCourtId);
    });

    it("lets the super-admin read any club", async () => {
      const res = await get("/api/court/list", { headers: superAdmin.headers, query: { organizationId: clubB.orgId } });
      expect(res.status).toBe(200);
      const booking = await get(`/api/court/booking/${clubB.padelBookingId}`, { headers: superAdmin.headers });
      expect(booking.status).toBe(200);
    });
  });

  describe("bookings", () => {
    it("refuses booking a court of another club, even an open one", async () => {
      const res = await post("/api/court/book", {
        headers: clubA.memberHeaders,
        body: { courtId: clubB.openPadelCourtId, date: tomorrowDate(), startTime: "10:00" },
      });
      expect(res.status).toBe(403);
    });

    it("refuses a participant listed twice", async () => {
      const res = await post("/api/court/book", {
        headers: clubA.ownerHeaders,
        body: {
          courtId: clubA.openPadelCourtId,
          date: tomorrowDate(),
          startTime: "10:00",
          participants: [{ userId: clubA.memberId }, { userId: clubA.memberId }],
        },
      });
      expect(res.status).toBe(400);
      expect((await res.json()).message).toMatch(/participant/i);
    });

    it("refuses joining a booking of another club", async () => {
      const res = await post("/api/court/join-booking", {
        headers: clubA.memberHeaders,
        body: { bookingId: clubB.padelBookingId, userId: clubA.memberId },
      });
      expect(res.status).toBe(404);
    });

    it("refuses adding a user of another club to a booking", async () => {
      const res = await post("/api/court/join-booking", {
        headers: clubA.memberHeaders,
        body: { bookingId: clubA.padelBookingId, userId: clubB.memberId },
      });
      expect(res.status).toBe(400);
    });

    it("lets a member join once, then refuses a second join", async () => {
      const first = await post("/api/court/join-booking", {
        headers: clubA.memberHeaders,
        body: { bookingId: clubA.padelBookingId, userId: clubA.memberId },
      });
      expect(first.status).toBeLessThan(300);

      const second = await post("/api/court/join-booking", {
        headers: clubA.memberHeaders,
        body: { bookingId: clubA.padelBookingId, userId: clubA.memberId },
      });
      expect(second.status).toBe(409);

      const participants = await db
        .select()
        .from(courtBookingParticipant)
        .where(
          and(
            eq(courtBookingParticipant.bookingId, clubA.padelBookingId),
            eq(courtBookingParticipant.userId, clubA.memberId),
          ),
        );
      expect(participants).toHaveLength(1);
    });
  });

  describe("tags and courses", () => {
    it("answers 404 when setting tags on a user who is not a member of the club", async () => {
      const res = await post("/api/club-tag/set-member-tags", {
        headers: clubA.ownerHeaders,
        body: { organizationId: clubA.orgId, userId: clubB.memberId, tagIds: [] },
      });
      expect(res.status).toBe(404);
    });

    it("lets the assigned coach mark attendance, but not once removed from the club", async () => {
      const allowed = await post("/api/course/mark-attendance", {
        headers: clubA.coachHeaders,
        body: { bookingId: clubA.courseBookingId, userId: clubA.memberId, status: "present" },
      });
      expect(allowed.status).not.toBe(403);

      await db
        .delete(member)
        .where(and(eq(member.userId, clubA.coachId), eq(member.organizationId, clubA.orgId)));

      const denied = await post("/api/course/mark-attendance", {
        headers: clubA.coachHeaders,
        body: { bookingId: clubA.courseBookingId, userId: clubA.memberId, status: "absent" },
      });
      expect(denied.status).toBe(403);
    });
  });
});
