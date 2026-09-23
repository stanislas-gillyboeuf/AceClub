import { and, count, eq } from "drizzle-orm";
import { db } from "../../../db";
import { member, user, clubMemberProfile, clubMemberTag, course, courseEnrollment } from "../../../db/schema";
import type { MemberPricingProfile } from "./engine";

export interface MemberWithProfile {
  userId: string;
  name: string;
  email: string;
  profile: MemberPricingProfile;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds a `MemberPricingProfile` (the engine's decoupled input, see lib/engine/types.ts) for
 * every real member of an org, in one batch — no N+1 queries, the pure engine call itself is
 * cheap and happens per-member in the caller's own loop.
 *
 * `birthDate`/`communeInsee`/`householdRank`/`licensedElsewhere` are left `undefined` whenever
 * the admin has never entered them for that member — this is DELIBERATE. The engine then reports
 * `status: "incomplete"` with the exact missing fields for that one member rather than guessing a
 * price. `lessonsPerWeek` (0 when no active enrollment) and `tags` (empty array when none) are
 * always fully known, since "no course" and "no tag" are real, complete answers, not gaps.
 */
export async function loadOrgMemberProfiles(
  organizationId: string,
  grid: { seasonStartDate: string },
): Promise<MemberWithProfile[]> {
  const [members, profiles, lessonCounts, tagRows] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.date_of_birth,
        memberSince: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId)),
    db
      .select({
        userId: clubMemberProfile.userId,
        licensedElsewhere: clubMemberProfile.licensedElsewhere,
        householdRank: clubMemberProfile.householdRank,
        communeInsee: clubMemberProfile.communeInsee,
      })
      .from(clubMemberProfile)
      .where(eq(clubMemberProfile.organizationId, organizationId)),
    db
      .select({ userId: courseEnrollment.userId, lessonsPerWeek: count() })
      .from(courseEnrollment)
      .innerJoin(course, eq(courseEnrollment.courseId, course.id))
      .where(and(eq(course.organizationId, organizationId), eq(course.status, "active")))
      .groupBy(courseEnrollment.userId),
    db
      .select({ userId: clubMemberTag.userId, tagId: clubMemberTag.tagId })
      .from(clubMemberTag)
      .where(eq(clubMemberTag.organizationId, organizationId)),
  ]);

  const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  const lessonsByUserId = new Map(lessonCounts.map((l) => [l.userId, l.lessonsPerWeek]));
  const tagsByUserId = new Map<string, string[]>();
  for (const row of tagRows) {
    const list = tagsByUserId.get(row.userId) ?? [];
    list.push(row.tagId);
    tagsByUserId.set(row.userId, list);
  }

  const seasonStart = new Date(grid.seasonStartDate);

  return members.map((m) => {
    const clubProfile = profileByUserId.get(m.userId);
    const profile: MemberPricingProfile = {
      birthDate: m.dateOfBirth ?? undefined,
      communeInsee: clubProfile?.communeInsee ?? undefined,
      householdRank: clubProfile?.householdRank ?? undefined,
      lessonsPerWeek: lessonsByUserId.get(m.userId) ?? 0,
      licensedElsewhere: clubProfile?.licensedElsewhere ?? undefined,
      tags: tagsByUserId.get(m.userId) ?? [],
      // Heuristic: "new" means this membership started after the grid's season began. No
      // separate "renewal" flag exists — a member who joined in a prior season is a renewal.
      isNew: m.memberSince >= seasonStart,
      registrationDate: toIsoDate(m.memberSince),
    };
    return { userId: m.userId, name: m.name, email: m.email, profile };
  });
}
