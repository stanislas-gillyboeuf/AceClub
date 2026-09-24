import { sql } from "drizzle-orm";
import { member, clubMemberProfile } from "../../../db/schema";

/**
 * Whether a member is an "adhérent" (someone who pays a cotisation). Owner, admin and coach do NOT
 * by default; an explicit `clubMemberProfile.isAdherent` (true/false) overrides the role rule.
 * null/undefined means "not set" → follow the role.
 */
export function isEffectiveAdherent(isAdherent: boolean | null | undefined, role: string): boolean {
  return isAdherent ?? role === "member";
}

/** SQL twin of `isEffectiveAdherent` — needs `clubMemberProfile` LEFT JOINed on the query. */
export const effectiveAdherentSql = sql<boolean>`coalesce(${clubMemberProfile.isAdherent}, ${member.role} = 'member')`;
