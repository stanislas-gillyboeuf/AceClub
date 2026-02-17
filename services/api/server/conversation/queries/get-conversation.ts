import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userBadge, badge, userTitle, title } from "../../../db/schema/reward/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { eq, and, ne, inArray, desc, sql } from "drizzle-orm";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../../../lib/cache";

export const getConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  // Check if user is a participant
  const [myParticipation] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id),
      ),
    )
    .limit(1);

  if (!myParticipation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  // Get conversation details
  const [conv] = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv) {
    return c.json({ error: "NotFound", message: "Conversation not found" }, 404);
  }

  // Get other participants with basic info
  const otherParticipants = await db
    .select({
      id: conversationParticipant.id,
      odUserId: user.id,
      userName: user.name,
      userImage: user.image,
    })
    .from(conversationParticipant)
    .innerJoin(user, eq(conversationParticipant.userId, user.id))
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        ne(conversationParticipant.userId, currentUser.id),
      ),
    );

  // Build enriched participants with per-user caching
  const enrichedParticipants = await enrichParticipants(otherParticipants);

  return c.json({
    id: conv.id,
    name: conv.name,
    type: conv.type,
    lastMessageAt: conv.lastMessageAt?.toISOString() || null,
    lastMessagePreview: conv.lastMessagePreview,
    lastMessageSenderId: conv.lastMessageSenderId,
    createdAt: conv.createdAt.toISOString(),
    unreadCount: myParticipation.unreadCount,
    isMuted: myParticipation.isMuted,
    encryptionKey: conv.encryptionKey || null,
    otherParticipants: enrichedParticipants,
  });
};

type Participant = { id: string; odUserId: string; userName: string; userImage: string | null };

interface UserEnrichment {
  level: number;
  totalAces: number;
  title: { code: string; nameFr: string; nameEn: string } | null;
  badges: { code: string; imageUrl: string; nameFr: string; nameEn: string }[];
  currentStreak: number;
  longestStreak: number;
  globalRank: number | null;
}

async function enrichParticipants(otherParticipants: Participant[]) {
  const participantUserIds = otherParticipants.map((p) => p.odUserId);
  if (participantUserIds.length === 0) return [];

  // Check per-user cache first
  const enrichmentMap = new Map<string, UserEnrichment>();
  const uncachedIds: string[] = [];

  await Promise.all(
    participantUserIds.map(async (userId) => {
      const hit = await cacheGet<UserEnrichment>(CacheKeys.userEnrichment(userId));
      if (hit) {
        enrichmentMap.set(userId, hit);
      } else {
        uncachedIds.push(userId);
      }
    }),
  );

  if (uncachedIds.length > 0) {
    // Fetch enrichment data only for uncached users
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

      db
        .select({
          odUserId: userLevel.userId,
          rank: sql<number>`(SELECT count(*) + 1 FROM user_level WHERE total_aces > ${userLevel.totalAces})`,
        })
        .from(userLevel)
        .where(inArray(userLevel.userId, uncachedIds)),
    ]);

    const cachePromises: Promise<void>[] = [];
    for (const userId of uncachedIds) {
      const level = levelsData.find((l) => l.odUserId === userId);
      const equippedTitle = titlesData.find((t) => t.odUserId === userId);
      const userBadges = badgesData.filter((b) => b.odUserId === userId).slice(0, 3);
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
        badges: userBadges.map((b) => ({
          code: b.badgeCode,
          imageUrl: b.badgeImageUrl,
          nameFr: b.badgeNameFr,
          nameEn: b.badgeNameEn,
        })),
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        globalRank: ranking?.rank ? Number(ranking.rank) : null,
      };

      enrichmentMap.set(userId, enrichment);
      cachePromises.push(cacheSet(CacheKeys.userEnrichment(userId), enrichment, CacheTTL.SHORT));
    }

    await Promise.all(cachePromises);
  }

  return otherParticipants.map((p) => {
    const enrichment = enrichmentMap.get(p.odUserId);
    return {
      id: p.id,
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
}
