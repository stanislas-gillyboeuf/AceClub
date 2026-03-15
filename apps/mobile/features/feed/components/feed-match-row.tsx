import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Calendar, Clock, Heart } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { PlayerView } from "@/components/ui/player-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToggleLike } from "@/hooks/use-match";
import { colors, semanticColors, radii } from "@/constants/theme";
import {
  formatMatchDate,
  formatMatchScore,
  formatMatchDuration,
  getHomeParticipant,
  getAwayParticipant,
} from "@/lib/format";
import type { MatchWithParticipants } from "@/types/match";

interface FeedMatchRowProps {
  match: MatchWithParticipants;
  currentUserId: string;
  onPress?: () => void;
}

export function FeedMatchRow({
  match,
  currentUserId,
  onPress,
}: FeedMatchRowProps) {
  const scheme = useColorScheme();
  const { mutate: toggleLike } = useToggleLike();

  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);

  const currentUserWon =
    match.participants.find((p) => p.userId === currentUserId)?.isWinner ??
    false;

  const score = formatMatchScore(match);
  const duration = formatMatchDuration(match);
  const date = formatMatchDate(match);

  const photos = match.photos ?? [];

  const sortedComments = [...(match.comments ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 2);
  const totalComments = match.comments?.length ?? 0;
  const hasMoreComments = totalComments > 2;

  return (
    <Card onPress={onPress}>
      {/* Match photos */}
      {photos.length > 0 && (
        <View style={styles.photosContainer}>
          {photos.map((photo, index) => (
            <Image
              key={photo.id}
              source={{ uri: photo.imageUrl }}
              style={[
                styles.feedPhoto,
                photos.length === 1 && styles.feedPhotoSingle,
                photos.length === 2 && index === 0 && { borderTopLeftRadius: radii.md },
                photos.length === 2 && index === 1 && { borderTopRightRadius: radii.md },
              ]}
              contentFit="cover"
              transition={200}
            />
          ))}
        </View>
      )}

      {/* Header: date + badge */}
      <View style={styles.headerRow}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={colors.accentGreen} strokeWidth={2} />
          <Text
            style={[
              styles.dateText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            {date}
          </Text>
        </View>
        <BadgePill
          label={currentUserWon ? "Victoire" : "Défaite"}
          variant={currentUserWon ? "success" : "danger"}
        />
      </View>

      {/* Players row */}
      <View style={styles.playersSection}>
        <View style={styles.playersLeft}>
          <PlayerView
            name={home?.user?.name ?? "N/A"}
            imageUrl={home?.user?.image}
            avatarSize={40}
            isWinner={home?.isWinner ?? false}
          />
          <Text
            style={[
              styles.vsText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            vs
          </Text>
          <PlayerView
            name={away?.user?.name ?? "N/A"}
            imageUrl={away?.user?.image}
            avatarSize={40}
            isWinner={away?.isWinner ?? false}
          />
        </View>

        <View style={styles.scoreSection}>
          <Text
            style={[
              styles.scoreText,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
          >
            {score}
          </Text>
          {duration && (
            <View style={styles.durationRow}>
              <Clock
                size={10}
                color={semanticColors.labelSecondary[scheme]}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.durationText,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {duration}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Like button */}
      <View style={styles.likeSection}>
        <Pressable
          onPress={() => toggleLike(match.id)}
          hitSlop={8}
          style={styles.likeButton}
        >
          <Heart
            size={18}
            color={match.hasLiked ? "#EF4444" : semanticColors.labelSecondary[scheme]}
            fill={match.hasLiked ? "#EF4444" : "transparent"}
            strokeWidth={2}
          />
          {match.likesCount > 0 && (
            <Text
              style={[
                styles.likeCount,
                {
                  color: match.hasLiked
                    ? "#EF4444"
                    : semanticColors.labelSecondary[scheme],
                },
              ]}
            >
              {match.likesCount}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Comments preview */}
      {sortedComments.length > 0 && (
        <View style={styles.commentsSection}>
          <View
            style={[
              styles.divider,
              { backgroundColor: semanticColors.divider[scheme] },
            ]}
          />
          {sortedComments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <Avatar
                imageUrl={comment.user?.image}
                name={comment.user?.name ?? "?"}
                size={24}
              />
              <Text
                style={[
                  styles.commentText,
                  { color: semanticColors.labelPrimary[scheme] },
                ]}
                numberOfLines={2}
              >
                <Text style={styles.commentAuthor}>
                  {comment.user?.name ?? "?"}{" "}
                </Text>
                {comment.content}
              </Text>
            </View>
          ))}
          {hasMoreComments && (
            <Text
              style={[
                styles.moreComments,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Voir les {totalComments} commentaires
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  photosContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
    marginHorizontal: -16,
    marginTop: -16,
  },
  feedPhoto: {
    flex: 1,
    height: 160,
  },
  feedPhotoSingle: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 15,
  },
  playersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playersLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vsText: {
    fontSize: 15,
  },
  scoreSection: {
    alignItems: "flex-end",
    gap: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  likeSection: {
    marginTop: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  likeCount: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  commentsSection: {
    marginTop: 8,
    gap: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentText: {
    fontSize: 12,
    flex: 1,
  },
  commentAuthor: {
    fontWeight: "600",
  },
  moreComments: {
    fontSize: 12,
  },
});
