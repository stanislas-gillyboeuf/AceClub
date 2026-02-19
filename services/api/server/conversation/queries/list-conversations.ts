import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userBadge, badge, userTitle, title } from "../../../db/schema/reward/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { eq, and, desc, ne, inArray, sql } from "drizzle-orm";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const listConversations = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Get all conversations where the user is a participant and hasn't deleted
  const myParticipations = await db
    .select({
      participantId: conversationParticipant.id,
      conversationId: conversationParticipant.conversationId,
      unreadCount: conversationParticipant.unreadCount,
      isMuted: conversationParticipant.isMuted,
      lastReadAt: conversationParticipant.lastReadAt,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.userId, currentUser.id),
        eq(conversationParticipant.isDeleted, false),
      ),
    );

  if (myParticipations.length === 0) {
    return c.json([]);
  }

  const conversationIds = myParticipations.map((p) => p.conversationId);

  // Get conversation details
  const conversations = await db
    .select({
      id: conversation.id,
      name: conversation.name,
      type: conversation.type,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageSenderId: conversation.lastMessageSenderId,
      createdAt: conversation.createdAt,
    })
    .from(conversation)
    .where(inArray(conversation.id, conversationIds))
    .orderBy(desc(conversation.lastMessageAt));

  // Batch: fetch ALL other participants across ALL conversations in 1 query
  const allOtherParticipants = await db
    .select({
      participantId: conversationParticipant.id,
      conversationId: conversationParticipant.conversationId,
      odUserId: user.id,
      userName: user.name,
      userImage: user.image,
    })
    .from(conversationParticipant)
    .innerJoin(user, eq(conversationParticipant.userId, user.id))
    .where(
      and(
        inArray(conversationParticipant.conversationId, conversationIds),
        ne(conversationParticipant.userId, currentUser.id),
      ),
    );

  // Collect all unique participant user IDs
  const allParticipantUserIds = [...new Set(allOtherParticipants.map((p) => p.odUserId))];

  // Batch fetch all enrichment data for ALL participants in parallel (5 queries total)
  const enrichmentMap =
    allParticipantUserIds.length > 0
      ? await fetchBatchEnrichments(allParticipantUserIds)
      : new Map();

  // Build result — no more async, just mapping
  const result = conversations.map((conv) => {
    const myParticipation = myParticipations.find((p) => p.conversationId === conv.id);
    const convParticipants = allOtherParticipants.filter((p) => p.conversationId === conv.id);

    const enrichedParticipants = convParticipants.map((p) => {
      const enrichment = enrichmentMap.get(p.odUserId);
      return {
        id: p.participantId,
        user: {
          id: p.odUserId,
          name: p.userName,
          image: p.userImage,
          level: enrichment?.level ?? 1,
          totalAces: enrichment?.totalAces ?? 0,
          title: enrichment?.title ?? null,
          badges: enrichment?.badges ?? [],
          currentStreak: enrichment?.currentStreak ?? 0,
          longestStreak: enrichment?.longestStreak ?? 0,
          globalRank: enrichment?.globalRank ?? null,
        },
      };
    });

    return {
      id: conv.id,
      name: conv.name,
      type: conv.type,
      lastMessageAt: conv.lastMessageAt?.toISOString() || null,
      lastMessagePreview: conv.lastMessagePreview,
      lastMessageSenderId: conv.lastMessageSenderId,
      createdAt: conv.createdAt.toISOString(),
      unreadCount: myParticipation?.unreadCount || 0,
      isMuted: myParticipation?.isMuted || false,
      otherParticipants: enrichedParticipants,
    };
  });

  // Sort by lastMessageAt descending (most recent first)
  result.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return c.json(result);
};

interface UserEnrichment {
  level: number;
  totalAces: number;
  title: { code: string; nameFr: string; nameEn: string } | null;
  badges: { code: string; imageUrl: string; nameFr: string; nameEn: string }[];
  currentStreak: number;
  longestStreak: number;
  globalRank: number | null;
}

async function fetchBatchEnrichments(userIds: string[]): Promise<Map<string, UserEnrichment>> {
  const map = new Map<string, UserEnrichment>();
  const uncachedIds: string[] = [];

  // Check Redis cache for each user's enrichment data
  await Promise.all(
    userIds.map(async (userId) => {
      const hit = await cacheGet<UserEnrichment>(CacheKeys.userEnrichment(userId));
      if (hit) {
        map.set(userId, hit);
      } else {
        uncachedIds.push(userId);
      }
    }),
  );

  if (uncachedIds.length === 0) return map;

  // Fetch enrichment data only for uncached users — 5 queries total
  const [levelsData, titlesData, badgesData, streaksData, rankingsData] = await Promise.all([
    db
      .select({
        odUserId: userLevel.userId,
        currentLevel: userLevel.currentLevel,
        totalAces: userLevel.totalAces,
      })
      .from(userLevel)
      .where(inArray(userLevel.userId, uncachedIds)),

    db
      .select({
        odUserId: userTitle.userId,
        titleCode: title.code,
        titleNameFr: title.nameFr,
        titleNameEn: title.nameEn,
      })
      .from(userTitle)
      .innerJoin(title, eq(userTitle.titleId, title.id))
      .where(inArray(userTitle.userId, uncachedIds)),

    db
      .select({
        odUserId: userBadge.userId,
        badgeCode: badge.code,
        badgeImageUrl: badge.imageUrl,
        badgeNameFr: badge.nameFr,
        badgeNameEn: badge.nameEn,
        unlockedAt: userBadge.unlockedAt,
      })
      .from(userBadge)
      .innerJoin(badge, eq(userBadge.badgeId, badge.id))
      .where(inArray(userBadge.userId, uncachedIds))
      .orderBy(desc(userBadge.unlockedAt)),

    db
      .select({
        odUserId: userStreak.userId,
        currentStreak: userStreak.currentStreak,
        longestStreak: userStreak.longestStreak,
      })
      .from(userStreak)
      .where(inArray(userStreak.userId, uncachedIds)),

    // Rankings — single query with correlated subquery for global rank
    db
      .select({
        odUserId: userLevel.userId,
        rank: sql<number>`(SELECT count(*) + 1 FROM user_level WHERE total_aces > ${userLevel.totalAces})`,
      })
      .from(userLevel)
      .where(inArray(userLevel.userId, uncachedIds)),
  ]);

  // Build enrichment for uncached users and cache each
  const cachePromises: Promise<void>[] = [];
  for (const userId of uncachedIds) {
    const level = levelsData.find((l) => l.odUserId === userId);
    const equippedTitle = titlesData.find((t) => t.odUserId === userId);
    const userBadgesArr = badgesData.filter((b) => b.odUserId === userId).slice(0, 3);
    const streak = streaksData.find((s) => s.odUserId === userId);
    const ranking = rankingsData.find((r) => r.odUserId === userId);

    const enrichment: UserEnrichment = {
      level: level?.currentLevel || 1,
      totalAces: level?.totalAces || 0,
      title: equippedTitle
        ? {
            code: equippedTitle.titleCode,
            nameFr: equippedTitle.titleNameFr,
            nameEn: equippedTitle.titleNameEn,
          }
        : null,
      badges: userBadgesArr.map((b) => ({
        code: b.badgeCode,
        imageUrl: b.badgeImageUrl,
        nameFr: b.badgeNameFr,
        nameEn: b.badgeNameEn,
      })),
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      globalRank: ranking?.rank ? Number(ranking.rank) : null,
    };

    map.set(userId, enrichment);
    cachePromises.push(cacheSet(CacheKeys.userEnrichment(userId), enrichment, CacheTTL.SHORT));
  }

  // Cache all in parallel (fire-and-forget, best-effort)
  await Promise.all(cachePromises);

  return map;
}
