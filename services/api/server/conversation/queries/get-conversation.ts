import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userBadge, badge, userTitle, title } from "../../../db/schema/reward/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { eq, and, ne, inArray, desc, sql } from "drizzle-orm";

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
        eq(conversationParticipant.userId, currentUser.id)
      )
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
        ne(conversationParticipant.userId, currentUser.id)
      )
    );

  // Get user IDs to fetch enriched data
  const participantUserIds = otherParticipants.map((p) => p.odUserId);

  // Fetch levels for participants
  const levelsData =
    participantUserIds.length > 0
      ? await db
          .select({
            odUserId: userLevel.userId,
            currentLevel: userLevel.currentLevel,
            totalAces: userLevel.totalAces,
          })
          .from(userLevel)
          .where(inArray(userLevel.userId, participantUserIds))
      : [];

  // Fetch equipped titles for participants
  const titlesData =
    participantUserIds.length > 0
      ? await db
          .select({
            odUserId: userTitle.userId,
            titleCode: title.code,
            titleNameFr: title.nameFr,
            titleNameEn: title.nameEn,
          })
          .from(userTitle)
          .innerJoin(title, eq(userTitle.titleId, title.id))
          .where(inArray(userTitle.userId, participantUserIds))
      : [];

  // Fetch badges for participants (limit to 3 most recent)
  const badgesData =
    participantUserIds.length > 0
      ? await db
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
          .orderBy(desc(userBadge.unlockedAt))
      : [];

  // Fetch streaks for participants
  const streaksData =
    participantUserIds.length > 0
      ? await db
          .select({
            odUserId: userStreak.userId,
            currentStreak: userStreak.currentStreak,
            longestStreak: userStreak.longestStreak,
          })
          .from(userStreak)
          .where(inArray(userStreak.userId, participantUserIds))
      : [];

  // Calculate global ranking for participants
  const rankingsData =
    participantUserIds.length > 0
      ? await Promise.all(
          participantUserIds.map(async (odUserId) => {
            const userLevelData = levelsData.find((l) => l.odUserId === odUserId);
            if (!userLevelData) return { odUserId, rank: null };

            const [rankResult] = await db
              .select({
                rank: sql<number>`count(*) + 1`,
              })
              .from(userLevel)
              .where(sql`${userLevel.totalAces} > ${userLevelData.totalAces}`);

            return { odUserId, rank: Number(rankResult?.rank) || 1 };
          })
        )
      : [];

  // Build enriched participants
  const enrichedParticipants = otherParticipants.map((p) => {
    const level = levelsData.find((l) => l.odUserId === p.odUserId);
    const equippedTitle = titlesData.find((t) => t.odUserId === p.odUserId);
    const userBadges = badgesData
      .filter((b) => b.odUserId === p.odUserId)
      .slice(0, 3);
    const streak = streaksData.find((s) => s.odUserId === p.odUserId);
    const ranking = rankingsData.find((r) => r.odUserId === p.odUserId);

    return {
      id: p.id,
      user: {
        id: p.odUserId,
        name: p.userName,
        image: p.userImage,
        // Level info
        level: level?.currentLevel || 1,
        totalAces: level?.totalAces || 0,
        // Title info
        title: equippedTitle
          ? {
              code: equippedTitle.titleCode,
              nameFr: equippedTitle.titleNameFr,
              nameEn: equippedTitle.titleNameEn,
            }
          : null,
        // Badges (top 3)
        badges: userBadges.map((b) => ({
          code: b.badgeCode,
          imageUrl: b.badgeImageUrl,
          nameFr: b.badgeNameFr,
          nameEn: b.badgeNameEn,
        })),
        // Streak info
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        // Ranking
        globalRank: ranking?.rank || null,
      },
    };
  });

  return c.json({
    id: conv.id,
    matchId: conv.matchId,
    name: conv.name,
    type: conv.type,
    lastMessageAt: conv.lastMessageAt?.toISOString() || null,
    lastMessagePreview: conv.lastMessagePreview,
    lastMessageSenderId: conv.lastMessageSenderId,
    createdAt: conv.createdAt.toISOString(),
    unreadCount: myParticipation.unreadCount,
    isMuted: myParticipation.isMuted,
    otherParticipants: enrichedParticipants,
  });
};
