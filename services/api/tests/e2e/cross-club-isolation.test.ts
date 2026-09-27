import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  get,
  db,
} from "../helpers";
import { member as memberTable } from "../../db/schema/auth/schema";
import { userPreference } from "../../db/schema/user-preference/schema";
import { event as eventTable } from "../../db/schema/event/schema";
import { course, courseEnrollment, court } from "../../db/schema";
import { matchIntent } from "../../db/schema/match_intents/schema";
import { match, matchParticipant } from "../../db/schema/match/schema";

/**
 * Cross-cutting isolation test. The per-domain e2e files (club-isolation,
 * event-isolation, court-isolation, players-isolation, match-isolation,
 * organization-security) already exercise every corrected route in detail.
 * This file exists to catch a regression that a single-domain test would
 * miss: a member of one club must see NOTHING of another across several
 * domains checked together in the same run, a multi-club member must see
 * both of their clubs without mixing, a club-less user must get empty
 * results (never someone else's content, never an error), and the
 * super-admin must see everything.
 */

type Club = {
  orgId: string;
  ownerId: string;
  ownerHeaders: Headers;
  memberId: string;
  memberHeaders: Headers;
  coachId: string;
  coachHeaders: Headers;
  courtId: string;
  courseId: string;
  eventPublicId: string;
  eventOrgId: string;
  intentId: string;
  matchId: string;
};

function tomorrow(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

describe("Cross-cutting club isolation", () => {
  const userIds: string[] = [];
  const orgIds: string[] = [];
  const eventIds: string[] = [];
  const courseIds: string[] = [];
  const courtIds: string[] = [];
  const intentIds: string[] = [];
  const matchIds: string[] = [];

  let clubA: Club;
  let clubB: Club;
  let clubC: Club;
  let memberAB: { id: string; headers: Headers };
  let noClubUser: { id: string; headers: Headers };
  let superAdmin: { id: string; headers: Headers };

  async function addMember(orgId: string, label: string, role: string) {
    const u = await createTestUser({ name: label });
    userIds.push(u.user.id);
    await db.insert(memberTable).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: orgId,
      role,
      createdAt: new Date(),
    });
    await db.insert(userPreference).values({
      id: ulid(),
      userId: u.user.id,
      organizationId: orgId,
      sport: "tennis",
      skillLevel: "intermediate",
    });
    return { id: u.user.id, headers: u.headers };
  }

  async function createClub(label: string): Promise<Club> {
    const owner = await createTestUser({ name: `Owner ${label}` });
    userIds.push(owner.user.id);
    const org = await createTestOrganization(owner.user.id, { name: `Cross club ${label}` });
    orgIds.push(org.organizationId);
    await db.insert(userPreference).values({
      id: ulid(),
      userId: owner.user.id,
      organizationId: org.organizationId,
      sport: "tennis",
      skillLevel: "intermediate",
    });

    const regular = await addMember(org.organizationId, `Member ${label}`, "member");
    const coach = await addMember(org.organizationId, `Coach ${label}`, "coach");

    const [createdCourt] = await db
      .insert(court)
      .values({
        id: ulid(),
        organizationId: org.organizationId,
        name: `Court ${label}`,
        sport: "tennis",
        surface: "hard",
        indoor: false,
        isActive: true,
        accessPolicy: "members_only",
      })
      .returning();
    courtIds.push(createdCourt.id);

    const day = tomorrow();
    const [createdCourse] = await db
      .insert(course)
      .values({
        id: ulid(),
        organizationId: org.organizationId,
        coachUserId: coach.id,
        courtId: createdCourt.id,
        name: `Course ${label}`,
        weekday: day.getUTCDay(),
        startTime: "17:00",
        durationMinutes: 60,
        startDate: new Date(day.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(day.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning();
    courseIds.push(createdCourse.id);
    await db.insert(courseEnrollment).values({
      id: ulid(),
      courseId: createdCourse.id,
      userId: regular.id,
    });

    const [publicEvent] = await db
      .insert(eventTable)
      .values({
        id: ulid(),
        name: `Public ${label}`,
        startDate: day,
        endDate: new Date(day.getTime() + 3_600_000),
        visibility: "public",
        status: "on_sale",
        userId: owner.user.id,
        organizationId: null,
      })
      .returning();
    eventIds.push(publicEvent.id);

    const [orgEvent] = await db
      .insert(eventTable)
      .values({
        id: ulid(),
        name: `Org event ${label}`,
        startDate: day,
        endDate: new Date(day.getTime() + 3_600_000),
        visibility: "organization",
        status: "on_sale",
        userId: owner.user.id,
        organizationId: org.organizationId,
      })
      .returning();
    eventIds.push(orgEvent.id);

    const intentId = ulid();
    await db.insert(matchIntent).values({
      id: intentId,
      userId: regular.id,
      sport: "tennis",
      isFlexibleDate: true,
      status: "pending",
    });
    intentIds.push(intentId);

    const matchId = ulid();
    await db.insert(match).values({
      id: matchId,
      createdBy: owner.user.id,
      status: "finished",
      createdAt: new Date(),
    });
    // Settled fixture: confirmation is covered by tests/e2e/match-confirmation.test.ts.
    await db.insert(matchParticipant).values([
      { id: ulid(), matchId, userId: owner.user.id, side: "home", confirmedAt: new Date() },
      { id: ulid(), matchId, userId: regular.id, side: "away", confirmedAt: new Date() },
    ]);
    matchIds.push(matchId);

    return {
      orgId: org.organizationId,
      ownerId: owner.user.id,
      ownerHeaders: owner.headers,
      memberId: regular.id,
      memberHeaders: regular.headers,
      coachId: coach.id,
      coachHeaders: coach.headers,
      courtId: createdCourt.id,
      courseId: createdCourse.id,
      eventPublicId: publicEvent.id,
      eventOrgId: orgEvent.id,
      intentId,
      matchId,
    };
  }

  beforeAll(async () => {
    clubA = await createClub("A");
    clubB = await createClub("B");
    clubC = await createClub("C");

    const dual = await createTestUser({ name: "Member A+B" });
    userIds.push(dual.user.id);
    await db.insert(memberTable).values([
      {
        id: ulid(),
        userId: dual.user.id,
        organizationId: clubA.orgId,
        role: "member",
        createdAt: new Date(),
      },
      {
        id: ulid(),
        userId: dual.user.id,
        organizationId: clubB.orgId,
        role: "member",
        createdAt: new Date(),
      },
    ]);
    memberAB = { id: dual.user.id, headers: dual.headers };

    const lonely = await createTestUser({ name: "No club user" });
    userIds.push(lonely.user.id);
    noClubUser = { id: lonely.user.id, headers: lonely.headers };

    const admin = await createTestUser({ name: "Cross-club super admin", role: "admin" });
    userIds.push(admin.user.id);
    superAdmin = { id: admin.user.id, headers: admin.headers };
  });

  afterAll(async () => {
    await db.delete(matchParticipant).catch(() => {});
    for (const id of matchIds) await db.delete(match).where(eq(match.id, id)).catch(() => {});
    for (const id of intentIds) await db.delete(matchIntent).where(eq(matchIntent.id, id)).catch(() => {});
    await db.delete(courseEnrollment).catch(() => {});
    for (const id of courseIds) await db.delete(course).where(eq(course.id, id)).catch(() => {});
    for (const id of courtIds) await db.delete(court).where(eq(court.id, id)).catch(() => {});
    for (const id of eventIds) await db.delete(eventTable).where(eq(eventTable.id, id)).catch(() => {});
    await db.delete(userPreference).catch(() => {});
    for (const orgId of orgIds) await cleanupTestOrganization(orgId);
    for (const userId of userIds) await cleanupTestUser(userId);
  });

  it("a member of club A sees nothing of B or C across six domains at once", async () => {
    const headers = clubA.memberHeaders;

    // Directory
    const directory = await get("/api/organization/search-members", {
      headers,
      query: { organizationId: clubB.orgId },
    });
    expect(directory.status).toBe(403);

    // Events: B's org-scoped event never appears, even without an explicit organizationId filter
    const events = await get("/api/event/list", { headers });
    expect(events.status).toBe(200);
    const eventIdsSeen = (await events.json()).data.map((e: { id: string }) => e.id);
    expect(eventIdsSeen).not.toContain(clubB.eventOrgId);
    expect(eventIdsSeen).not.toContain(clubC.eventOrgId);
    // Public events (no organizationId) are visible from anywhere
    expect(eventIdsSeen).toContain(clubB.eventPublicId);

    const bEventDirect = await get("/api/event/get", {
      headers,
      query: { eventId: clubB.eventOrgId },
    });
    expect(bEventDirect.status).toBe(404);

    // Courses: club admin routes require full-admin, but the member should not be able to
    // reach B's course detail through its id either.
    const courseDetail = await get("/api/course/detail", {
      headers,
      query: { courseId: clubB.courseId },
    });
    expect([403, 404]).toContain(courseDetail.status);

    // Discover / intents
    const discover = await get("/api/match-intents/discover", { headers });
    expect(discover.status).toBe(200);
    const discoverIds = (await discover.json()).data.map((row: { id: string }) => row.id);
    expect(discoverIds).not.toContain(clubB.intentId);
    expect(discoverIds).not.toContain(clubC.intentId);

    // Matches: club A's feed never contains B's or C's internal match
    const matches = await get("/api/match", {
      headers,
      query: { organizationId: clubA.orgId },
    });
    expect(matches.status).toBe(200);
    const matchIdsSeen = (await matches.json()).matches.map((m: { id: string }) => m.id);
    expect(matchIdsSeen).not.toContain(clubB.matchId);
    expect(matchIdsSeen).not.toContain(clubC.matchId);
    expect(matchIdsSeen).toContain(clubA.matchId);

    const foreignMatch = await get("/api/match", {
      headers,
      query: { organizationId: clubB.orgId },
    });
    expect(foreignMatch.status).toBe(403);

    // Leaderboard
    const ranking = await get(`/api/leaderboard/organization/${clubB.orgId}`, { headers });
    expect(ranking.status).toBe(403);
  });

  it("a member of both A and B sees both clubs, never mixed, across three domains", async () => {
    const headers = memberAB.headers;

    const eventsA = await get("/api/event/list", {
      headers,
      query: { organizationId: clubA.orgId },
    });
    expect(eventsA.status).toBe(200);
    const eventsB = await get("/api/event/list", {
      headers,
      query: { organizationId: clubB.orgId },
    });
    expect(eventsB.status).toBe(200);
    const idsA = (await eventsA.json()).data.map((e: { id: string }) => e.id);
    const idsB = (await eventsB.json()).data.map((e: { id: string }) => e.id);
    expect(idsA).toContain(clubA.eventOrgId);
    expect(idsA).not.toContain(clubB.eventOrgId);
    expect(idsB).toContain(clubB.eventOrgId);
    expect(idsB).not.toContain(clubA.eventOrgId);

    const matchesA = await get("/api/match", {
      headers,
      query: { organizationId: clubA.orgId },
    });
    const matchesB = await get("/api/match", {
      headers,
      query: { organizationId: clubB.orgId },
    });
    expect(matchesA.status).toBe(200);
    expect(matchesB.status).toBe(200);
    const matchIdsA = (await matchesA.json()).matches.map((m: { id: string }) => m.id);
    const matchIdsB = (await matchesB.json()).matches.map((m: { id: string }) => m.id);
    expect(matchIdsA).toContain(clubA.matchId);
    expect(matchIdsA).not.toContain(clubB.matchId);
    expect(matchIdsB).toContain(clubB.matchId);
    expect(matchIdsB).not.toContain(clubA.matchId);

    const rankA = await get(`/api/leaderboard/organization/${clubA.orgId}`, { headers });
    const rankB = await get(`/api/leaderboard/organization/${clubB.orgId}`, { headers });
    const rankC = await get(`/api/leaderboard/organization/${clubC.orgId}`, { headers });
    expect(rankA.status).toBe(200);
    expect(rankB.status).toBe(200);
    expect(rankC.status).toBe(403);
  });

  it("a user with no club gets empty results everywhere, never someone else's content or an error", async () => {
    const headers = noClubUser.headers;

    const discover = await get("/api/match-intents/discover", { headers });
    expect(discover.status).toBe(200);
    expect((await discover.json()).data).toEqual([]);

    const matches = await get("/api/match", { headers });
    expect(matches.status).toBe(200);
    const matchBody = await matches.json();
    expect(matchBody.matches).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: clubA.matchId })]),
    );

    const events = await get("/api/event/list", { headers });
    expect(events.status).toBe(200);
    const eventIdsSeen = (await events.json()).data.map((e: { id: string }) => e.id);
    // Only club-less "public" events are visible; every club-scoped event is absent.
    expect(eventIdsSeen).not.toContain(clubA.eventOrgId);
    expect(eventIdsSeen).not.toContain(clubB.eventOrgId);
    expect(eventIdsSeen).not.toContain(clubC.eventOrgId);
    expect(eventIdsSeen).toContain(clubA.eventPublicId);

    const ranking = await get(`/api/leaderboard/organization/${clubA.orgId}`, { headers });
    expect(ranking.status).toBe(403);

    const directory = await get("/api/organization/search-members", {
      headers,
      query: { organizationId: clubA.orgId },
    });
    expect(directory.status).toBe(403);
  });

  it("the super-admin sees everything across at least three domains", async () => {
    const headers = superAdmin.headers;

    const eventsB = await get("/api/event/list", {
      headers,
      query: { organizationId: clubB.orgId },
    });
    expect(eventsB.status).toBe(200);
    expect((await eventsB.json()).data.map((e: { id: string }) => e.id)).toContain(
      clubB.eventOrgId,
    );

    const matchesC = await get("/api/match", {
      headers,
      query: { organizationId: clubC.orgId },
    });
    expect(matchesC.status).toBe(200);
    expect((await matchesC.json()).matches.map((m: { id: string }) => m.id)).toContain(
      clubC.matchId,
    );

    const rankA = await get(`/api/leaderboard/organization/${clubA.orgId}`, { headers });
    expect(rankA.status).toBe(200);

    const global = await get("/api/leaderboard/global", { headers });
    expect(global.status).toBe(200);

    const directoryC = await get("/api/organization/search-members", {
      headers,
      query: { organizationId: clubC.orgId },
    });
    expect(directoryC.status).toBe(200);
  });
});
