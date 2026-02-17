import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userBadge, badge, userTitle, title } from "../../../db/schema/reward/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { eq, and, ne, inArray, desc, sql } from "drizzle-orm";
import { cached, CacheKeys, CacheTTL } from "../../../lib/cache";

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

  // Build enriched participants with caching
  const enrichedParticipants = await cached(
    CacheKeys.convParticipants(conversationId),
    CacheTTL.MEDIUM,
    () => enrichParticipants(otherParticipants),
  );

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

async function enrichParticipants(otherParticipants: Participant[]) {
  const participantUserIds = otherParticipants.map((p) => p.odUserId);
  if (participantUserIds.length === 0) return [];

  // Fetch all enrichment data in parallel
  const [levelsData, titlesData, badgesData, streaksData, rankingsData] = await Promise.all([
    // Levels
    db
      .select({
        odUserId: userLevel.userId,
        currentLevel: userLevel.currentLevel,
        totalAces: userLevel.totalAces,
      })
      .from(userLevel)
      .where(inArray(userLevel.userId, participantUserIds)),

    // Equipped titles
    db
      .select({
        odUserId: userTitle.userId,
        titleCode: title.code,
        titleNameFr: title.nameFr,
        titleNameEn: title.nameEn,
      })
      .from(userTitle)
      .innerJoin(title, eq(userTitle.titleId, title.id))
      .where(inArray(userTitle.userId, participantUserIds)),

    // Badges
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
      .where(inArray(userBadge.userId, participantUserIds))
      .orderBy(desc(userBadge.unlockedAt)),

    // Streaks
    db
      .select({
        odUserId: userStreak.userId,
        currentStreak: userStreak.currentStreak,
        longestStreak: userStreak.longestStreak,
      })
      .from(userStreak)
      .where(inArray(userStreak.userId, participantUserIds)),

    // Rankings — single query with correlated subquery instead of N separate queries
    db
      .select({
        odUserId: userLevel.userId,
        rank: sql<number>`(SELECT count(*) + 1 FROM user_level WHERE total_aces > ${userLevel.totalAces})`,
      })
      .from(userLevel)
      .where(inArray(userLevel.userId, participantUserIds)),
  ]);

  return otherParticipants.map((p) => {
    const level = levelsData.find((l) => l.odUserId === p.odUserId);
    const equippedTitle = titlesData.find((t) => t.odUserId === p.odUserId);
    const userBadges = badgesData.filter((b) => b.odUserId === p.odUserId).slice(0, 3);
    const streak = streaksData.find((s) => s.odUserId === p.odUserId);
    const ranking = rankingsData.find((r) => r.odUserId === p.odUserId);

    return {
      id: p.id,
      user: {
        id: p.odUserId,
        name: p.userName,
        image: p.userImage,
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
      },
    };
  });
}
