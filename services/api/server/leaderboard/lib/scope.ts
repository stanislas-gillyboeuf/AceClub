import { sql } from "drizzle-orm";
import { user } from "../../../db/schema/auth/schema";
import { isSuperAdmin, type AccessUser } from "../../../lib/club-access-core";

/** Ghosts and banned accounts never appear in a ranking. */
export const rankableUserSql = sql`coalesce(${user.is_ghost}, false) = false and coalesce(${user.banned}, false) = false`;

export type LeaderboardScope =
  | { kind: "club"; organizationId: string }
  | { kind: "platform" }
  | { kind: "forbidden" };

/**
 * A ranking is a club's: it needs an `organizationId` the caller belongs to. Without one it is the
 * platform-wide ranking, which only a super-admin may read. `isMember` is resolved by the route.
 */
export function resolveLeaderboardScope(input: {
  organizationId?: string | null;
  user: AccessUser;
  isMember: boolean;
}): LeaderboardScope {
  if (input.organizationId) {
    if (isSuperAdmin(input.user) || input.isMember) {
      return { kind: "club", organizationId: input.organizationId };
    }
    return { kind: "forbidden" };
  }
  return isSuperAdmin(input.user) ? { kind: "platform" } : { kind: "forbidden" };
}
