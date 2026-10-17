import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { db } from "../db";
import { clubMemberProfile } from "../db/schema/club-member/schema";
import { member, user } from "../db/schema/auth/schema";
import { resolveBirthDate } from "../server/pricing/lib/resolve-birth-date";
import { isValidIsoDate } from "../server/pricing/lib/engine";

const ADULT_AGE = 18;

/** Age as of today, UTC. */
function ageToday(birthDateIso: string): number {
  const [year, month, day] = birthDateIso.split("-").map(Number);
  const now = new Date();
  let age = now.getUTCFullYear() - year;
  if (now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day)) {
    age -= 1;
  }
  return age;
}

/**
 * A birth date we can't resolve is treated as a minor, not an adult — the safe default when the
 * data is simply missing (never computed from a guess).
 */
export async function isMinor(userId: string, organizationId: string): Promise<boolean> {
  const [[profile], [accountUser]] = await Promise.all([
    db
      .select({ dateOfBirth: clubMemberProfile.dateOfBirth })
      .from(clubMemberProfile)
      .where(and(eq(clubMemberProfile.userId, userId), eq(clubMemberProfile.organizationId, organizationId)))
      .limit(1),
    db.select({ dateOfBirth: user.date_of_birth }).from(user).where(eq(user.id, userId)).limit(1),
  ]);

  const birthDate = resolveBirthDate(profile?.dateOfBirth, accountUser?.dateOfBirth);
  if (!birthDate || !isValidIsoDate(birthDate)) return true;

  return ageToday(birthDate) < ADULT_AGE;
}

export interface GuardianResolution {
  /** Other members of the same household, in this club, who are not themselves minors. */
  guardianIds: string[];
  /** True when the member has no household, or the household has no other adult member in
   * this club — the "add anyway, flag it" case decided for this feature. */
  hasNoGuardian: boolean;
}

export async function resolveGuardianUserIds(
  userId: string,
  organizationId: string,
): Promise<GuardianResolution> {
  const [myProfile] = await db
    .select({ householdId: clubMemberProfile.householdId })
    .from(clubMemberProfile)
    .where(and(eq(clubMemberProfile.userId, userId), eq(clubMemberProfile.organizationId, organizationId)))
    .limit(1);

  if (!myProfile?.householdId) {
    return { guardianIds: [], hasNoGuardian: true };
  }

  const householdMembers = await db
    .select({ userId: clubMemberProfile.userId })
    .from(clubMemberProfile)
    .where(
      and(
        eq(clubMemberProfile.householdId, myProfile.householdId),
        eq(clubMemberProfile.organizationId, organizationId),
        ne(clubMemberProfile.userId, userId),
        isNotNull(clubMemberProfile.householdId),
      ),
    );

  const guardianIds: string[] = [];
  for (const member of householdMembers) {
    if (!(await isMinor(member.userId, organizationId))) {
      guardianIds.push(member.userId);
    }
  }

  return { guardianIds, hasNoGuardian: guardianIds.length === 0 };
}

/**
 * A coach must never have a private, 1:1 conversation with a minor of a club they coach in —
 * the only acceptable context is a group that also has a parent present. Checked against every
 * club the two users share, not just one.
 */
export async function isCoachMinorDirectBlocked(
  userAId: string,
  userBId: string,
  sharedOrganizationIds: string[],
): Promise<boolean> {
  if (sharedOrganizationIds.length === 0) return false;

  const roles = await db
    .select({ userId: member.userId, organizationId: member.organizationId, role: member.role })
    .from(member)
    .where(
      and(inArray(member.userId, [userAId, userBId]), inArray(member.organizationId, sharedOrganizationIds)),
    );

  for (const orgId of sharedOrganizationIds) {
    const roleA = roles.find((r) => r.userId === userAId && r.organizationId === orgId)?.role;
    const roleB = roles.find((r) => r.userId === userBId && r.organizationId === orgId)?.role;
    if (roleA === "coach" && roleB !== "coach" && (await isMinor(userBId, orgId))) return true;
    if (roleB === "coach" && roleA !== "coach" && (await isMinor(userAId, orgId))) return true;
  }
  return false;
}
