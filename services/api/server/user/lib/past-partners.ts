import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../../db";
import { conversation, conversationParticipant, match, matchParticipant } from "../../../db/schema";

export interface PartnerSignal {
  userId: string;
  at: Date;
}

export interface PastPartner {
  userId: string;
  lastInteractionAt: Date;
}

/**
 * Pure: from a flat list of "I interacted with this user at this time" signals (one per shared
 * match, one per active direct conversation), keep the most recent signal per user, drop blocked
 * users, and return the top `limit` by recency. No I/O — unit tested in isolation.
 */
export function mergePastPartnerSignals(
  signals: readonly PartnerSignal[],
  excludeIds: ReadonlySet<string>,
  limit: number,
): PastPartner[] {
  const best = new Map<string, Date>();
  for (const signal of signals) {
    if (excludeIds.has(signal.userId)) continue;
    const current = best.get(signal.userId);
    if (!current || signal.at > current) best.set(signal.userId, signal.at);
  }
  return [...best.entries()]
    .map(([userId, lastInteractionAt]) => ({ userId, lastInteractionAt }))
    .sort((a, b) => b.lastInteractionAt.getTime() - a.lastInteractionAt.getTime())
    .slice(0, limit);
}

/** Every match-or-active-direct-conversation signal involving `userId`, across all clubs. */
export async function loadPartnerSignals(userId: string): Promise<PartnerSignal[]> {
  const mine = alias(matchParticipant, "mine");
  const otherParticipant = alias(matchParticipant, "otherParticipant");
  const myConversation = alias(conversationParticipant, "myConversation");
  const otherConversation = alias(conversationParticipant, "otherConversation");

  const [matchRows, conversationRows] = await Promise.all([
    db
      .select({ userId: otherParticipant.userId, at: match.createdAt })
      .from(mine)
      .innerJoin(
        otherParticipant,
        and(eq(otherParticipant.matchId, mine.matchId), ne(otherParticipant.userId, mine.userId)),
      )
      .innerJoin(match, eq(match.id, mine.matchId))
      .where(eq(mine.userId, userId)),
    db
      .select({
        userId: otherConversation.userId,
        at: sql<Date>`coalesce(${conversation.lastMessageAt}, ${conversation.createdAt})`,
      })
      .from(myConversation)
      .innerJoin(
        otherConversation,
        and(
          eq(otherConversation.conversationId, myConversation.conversationId),
          ne(otherConversation.userId, myConversation.userId),
        ),
      )
      .innerJoin(conversation, eq(conversation.id, myConversation.conversationId))
      .where(
        and(
          eq(myConversation.userId, userId),
          eq(conversation.type, "direct"),
          eq(conversation.status, "active"),
        ),
      ),
  ]);

  return [...matchRows, ...conversationRows];
}

/**
 * Of `candidateIds`, the subset with whom `userId` already has a direct relation (a shared match
 * or an active direct conversation) — used to let match-intent teammates be pre-filled across
 * clubs when that explicit relation already exists (see match_intents/lib/visibility.ts).
 */
export async function getDirectRelationUserIds(
  userId: string,
  candidateIds: readonly string[],
): Promise<Set<string>> {
  const candidates = new Set(candidateIds);
  if (candidates.size === 0) return new Set();

  const mine = alias(matchParticipant, "mine");
  const otherParticipant = alias(matchParticipant, "otherParticipant");
  const myConversation = alias(conversationParticipant, "myConversation");
  const otherConversation = alias(conversationParticipant, "otherConversation");

  const [matchRows, conversationRows] = await Promise.all([
    db
      .select({ userId: otherParticipant.userId })
      .from(mine)
      .innerJoin(
        otherParticipant,
        and(
          eq(otherParticipant.matchId, mine.matchId),
          inArray(otherParticipant.userId, [...candidates]),
          ne(otherParticipant.userId, mine.userId),
        ),
      )
      .where(eq(mine.userId, userId)),
    db
      .select({ userId: otherConversation.userId })
      .from(myConversation)
      .innerJoin(
        otherConversation,
        and(
          eq(otherConversation.conversationId, myConversation.conversationId),
          inArray(otherConversation.userId, [...candidates]),
          ne(otherConversation.userId, myConversation.userId),
        ),
      )
      .innerJoin(conversation, eq(conversation.id, myConversation.conversationId))
      .where(
        and(
          eq(myConversation.userId, userId),
          eq(conversation.type, "direct"),
          eq(conversation.status, "active"),
        ),
      ),
  ]);

  return new Set([...matchRows.map((r) => r.userId), ...conversationRows.map((r) => r.userId)]);
}
