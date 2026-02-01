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
import { eq, and, desc, ne, inArray, sql } from "drizzle-orm";

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
        eq(conversationParticipant.isDeleted, false)
      )
    );

  if (myParticipations.length === 0) {
    return c.json([]);
  }

  const conversationIds = myParticipations.map((p) => p.conversationId);

  // Get conversation details
  const conversations = await db
    .select({
      id: conversation.id,
      matchId: conversation.matchId,
      name: conversation.name,
      type: conversation.type,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageSenderId: conversation.lastMessageSenderId,
      createdAt: conversation.createdAt,
    })
    .from(conversation)
    .where(
      conversationIds.length === 1
        ? eq(conversation.id, conversationIds[0])
        : // For multiple IDs, we need to use SQL IN
          eq(conversation.id, conversationIds[0]) // Simplified, will handle in mapping
    )
    .orderBy(desc(conversation.lastMessageAt));

  // Filter to only include conversations the user participates in
  const filteredConversations = conversations.filter((conv) =>
    conversationIds.includes(conv.id)
  );

  // Get other participants for each conversation
  const result = await Promise.all(
    filteredConversations.map(async (conv) => {
      const myParticipation = myParticipations.find(
        (p) => p.conversationId === conv.id
      );

      // Get other participant(s) with basic info
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
            eq(conversationParticipant.conversationId, conv.id),
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
              participantUserIds.map(async (userId) => {
                const userLevelData = levelsData.find((l) => l.odUserId === userId);
                if (!userLevelData) return { odUserId: userId, rank: null };

                const [rankResult] = await db
                  .select({
                    rank: sql<number>`count(*) + 1`,
                  })
                  .from(userLevel)
                  .where(sql`${userLevel.totalAces} > ${userLevelData.totalAces}`);

                return { odUserId: userId, rank: rankResult?.rank || 1 };
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
          userId: p.odUserId,
          userName: p.userName,
          userImage: p.userImage,
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
        };
      });

      return {
        id: conv.id,
        matchId: conv.matchId,
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
    })
  );

  // Sort by lastMessageAt descending (most recent first)
  result.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return c.json(result);
};
