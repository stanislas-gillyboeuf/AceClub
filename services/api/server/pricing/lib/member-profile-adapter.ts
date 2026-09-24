import { and, count, eq, isNotNull } from "drizzle-orm";
import { db } from "../../../db";
import {
  member,
  user,
  clubMemberProfile,
  clubMemberTag,
  course,
  courseEnrollment,
  household,
  memberCotisation,
} from "../../../db/schema";
import { computeCotisation, type MemberPricingProfile, type TarifGridSnapshot } from "./engine";
import { computeHouseholdRanks, stripHouseholdRules, type HouseholdRankSource } from "./household-rank";
import { resolveBirthDate } from "./resolve-birth-date";
import { resolveIsNew } from "./resolve-is-new";
import { isEffectiveAdherent } from "../../club-member/lib/adherent";

export interface MemberWithProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  /** Effective value: `clubMemberProfile.isAdherent ?? role === "member"`. */
  isAdherent: boolean;
  householdId: string | null;
  householdName: string | null;
  /** Where `profile.householdRank` comes from; null when no rank applies or none could be decided. */
  householdRankSource: HouseholdRankSource | null;
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
 * `birthDate`/`communeInsee`/`licensedElsewhere` are left `undefined` whenever the admin has never
 * entered them for that member — this is DELIBERATE. The engine then reports `status:
 * "incomplete"` with the exact missing fields for that one member rather than guessing a price.
 * `lessonsPerWeek` (0 when no active enrollment) and `tags` (empty array when none) are always
 * fully known, since "no course" and "no tag" are real, complete answers, not gaps.
 *
 * `householdRank` is COMPUTED here (server/pricing/lib/household-rank.ts): manual override, else
 * the rank frozen on an already-issued cotisation of `seasonLabel`, else the rank derived from each
 * household member's price without family discount. A member without household is alone (rank 1).
 */
export async function loadOrgMemberProfiles(
  organizationId: string,
  grid: TarifGridSnapshot,
  seasonLabel: string,
): Promise<MemberWithProfile[]> {
  const [members, profiles, lessonCounts, tagRows, households, frozenRows] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.date_of_birth,
        memberSince: member.createdAt,
        role: member.role,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId)),
    db
      .select({
        userId: clubMemberProfile.userId,
        licensedElsewhere: clubMemberProfile.licensedElsewhere,
        householdRank: clubMemberProfile.householdRank,
        householdId: clubMemberProfile.householdId,
        communeInsee: clubMemberProfile.communeInsee,
        dateOfBirth: clubMemberProfile.dateOfBirth,
        isAdherent: clubMemberProfile.isAdherent,
        isNewMember: clubMemberProfile.isNewMember,
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
    db
      .select({ id: household.id, name: household.name })
      .from(household)
      .where(eq(household.organizationId, organizationId)),
    db
      .select({ userId: memberCotisation.userId, rank: memberCotisation.householdRankFrozen })
      .from(memberCotisation)
      .where(
        and(
          eq(memberCotisation.organizationId, organizationId),
          eq(memberCotisation.seasonLabel, seasonLabel),
          isNotNull(memberCotisation.householdRankFrozen),
        ),
      ),
  ]);

  const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  const lessonsByUserId = new Map(lessonCounts.map((l) => [l.userId, l.lessonsPerWeek]));
  const tagsByUserId = new Map<string, string[]>();
  for (const row of tagRows) {
    const list = tagsByUserId.get(row.userId) ?? [];
    list.push(row.tagId);
    tagsByUserId.set(row.userId, list);
  }
  const householdNameById = new Map(households.map((h) => [h.id, h.name]));
  const frozenByUserId = new Map(frozenRows.map((r) => [r.userId, r.rank as number]));

  const seasonStart = new Date(grid.seasonStartDate);
  const priceGrid = stripHouseholdRules(grid);

  const built = members.map((m) => {
    const clubProfile = profileByUserId.get(m.userId);
    const isAdherent = isEffectiveAdherent(clubProfile?.isAdherent, m.role);
    // householdRank is filled in below, once every household member's price is known.
    const profile: MemberPricingProfile = {
      birthDate: resolveBirthDate(clubProfile?.dateOfBirth, m.dateOfBirth),
      communeInsee: clubProfile?.communeInsee ?? undefined,
      lessonsPerWeek: lessonsByUserId.get(m.userId) ?? 0,
      licensedElsewhere: clubProfile?.licensedElsewhere ?? undefined,
      tags: tagsByUserId.get(m.userId) ?? [],
      // Explicit flag first; otherwise "new" = the membership started after the season began.
      isNew: resolveIsNew(clubProfile?.isNewMember, m.memberSince, seasonStart),
      registrationDate: toIsoDate(m.memberSince),
    };
    return { m, clubProfile, isAdherent, profile, householdId: clubProfile?.householdId ?? null };
  });

  const ranks = computeHouseholdRanks(
    built.map(({ m, clubProfile, isAdherent, profile, householdId }) => {
      let priceCents: number | null = null;
      // Only ranked household members need a price — WITHOUT family discount, so it does not
      // depend on the rank being computed.
      if (householdId && isAdherent) {
        const breakdown = computeCotisation(priceGrid, { ...profile, householdRank: 1 });
        priceCents = breakdown.status === "complete" ? breakdown.totalCents : null;
      }
      return {
        userId: m.userId,
        householdId,
        counted: isAdherent,
        priceCents,
        birthDate: profile.birthDate,
        override: clubProfile?.householdRank ?? null,
        frozen: frozenByUserId.get(m.userId) ?? null,
      };
    }),
  );

  return built.map(({ m, isAdherent, profile, householdId }) => {
    const result = ranks.get(m.userId);
    return {
      userId: m.userId,
      name: m.name,
      email: m.email,
      role: m.role,
      isAdherent,
      householdId,
      householdName: householdId ? (householdNameById.get(householdId) ?? null) : null,
      householdRankSource: result?.source ?? null,
      profile: { ...profile, householdRank: result?.rank ?? undefined },
    };
  });
}
