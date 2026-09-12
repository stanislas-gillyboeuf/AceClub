import { assertOrgAdmin } from "./org-member";

/** Eligible for the club-admin dashboard at all — owner/admin, same check as the court domain. */
export async function assertClubAdmin(userId: string, organizationId: string): Promise<boolean> {
  return assertOrgAdmin(userId, organizationId);
}

/**
 * Full admin — the "restricted dashboard access" tier is retired for now, so this is
 * currently equivalent to assertClubAdmin. Kept as a separate name so the financial/
 * messaging/roles gates it guards are easy to find if that tier comes back.
 */
export async function assertClubFullAdmin(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  return assertClubAdmin(userId, organizationId);
}
