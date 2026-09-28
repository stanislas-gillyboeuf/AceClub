import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "../db";
import { userBlock } from "../db/schema";

export interface BlockRow {
  blockerUserId: string;
  blockedUserId: string;
}

/** Pure: from raw block rows involving `viewerId`, the set of "other side" ids that are blocked
 * either way. Isolated from the DB query so it's unit-testable without a database. */
export function resolveBlockedUserIds(viewerId: string, rows: readonly BlockRow[]): Set<string> {
  const result = new Set<string>();
  for (const row of rows) {
    if (row.blockerUserId === viewerId) result.add(row.blockedUserId);
    else if (row.blockedUserId === viewerId) result.add(row.blockerUserId);
  }
  return result;
}

/** True if either user has blocked the other. Self-pairs are never blocked. */
export async function isBlockedEitherWay(userIdA: string, userIdB: string): Promise<boolean> {
  if (userIdA === userIdB) return false;
  const [row] = await db
    .select({ id: userBlock.id })
    .from(userBlock)
    .where(
      or(
        and(eq(userBlock.blockerUserId, userIdA), eq(userBlock.blockedUserId, userIdB)),
        and(eq(userBlock.blockerUserId, userIdB), eq(userBlock.blockedUserId, userIdA)),
      ),
    )
    .limit(1);
  return !!row;
}

/**
 * Of `candidateIds`, the subset that has a block relationship (either direction) with `viewerId`
 * — one query, for callers that need to filter/hide a whole list (search results, match
 * participants) rather than check a single pair.
 */
export async function getBlockedUserIds(
  viewerId: string,
  candidateIds: readonly string[],
): Promise<Set<string>> {
  const ids = [...new Set(candidateIds.filter((id) => id !== viewerId))];
  if (ids.length === 0) return new Set();

  const rows = await db
    .select({ blockerUserId: userBlock.blockerUserId, blockedUserId: userBlock.blockedUserId })
    .from(userBlock)
    .where(
      or(
        and(eq(userBlock.blockerUserId, viewerId), inArray(userBlock.blockedUserId, ids)),
        and(inArray(userBlock.blockerUserId, ids), eq(userBlock.blockedUserId, viewerId)),
      ),
    );

  return resolveBlockedUserIds(viewerId, rows);
}
