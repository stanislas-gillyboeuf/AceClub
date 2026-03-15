import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Calendar } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { PlayerView } from "@/components/ui/player-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import {
  formatMatchDate,
  formatMatchDuration,
  getHomeParticipant,
  getAwayParticipant,
  getStructuredMatchScore,
} from "@/lib/format";
import { SetScoresView } from "@/components/ui/set-scores-view";
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

  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);

  const currentUserWon =
    match.participants.find((p) => p.userId === currentUserId)?.isWinner ??
    false;

  const structuredScore = getStructuredMatchScore(match);
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

      {/* Header: date + duration + badge */}
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
          {duration && (
            <>
              <Text style={[styles.dotSep, { color: semanticColors.labelTertiary[scheme] }]}>·</Text>
              <Text
                style={[
                  styles.durationText,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {duration}
              </Text>
            </>
          )}
        </View>
        <BadgePill
          label={currentUserWon ? "Victoire" : "Défaite"}
          variant={currentUserWon ? "success" : "danger"}
        />
      </View>

      {/* Set-by-set scores */}
      {structuredScore ? (
        <SetScoresView
          score={structuredScore}
          homeName={home?.user?.name ?? "N/A"}
          awayName={away?.user?.name ?? "N/A"}
          homeIsWinner={home?.isWinner}
          size="compact"
        />
      ) : (
        <View style={styles.playersSection}>
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
      )}

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
  dotSep: {
    fontSize: 13,
  },
  durationText: {
    fontSize: 13,
  },
  playersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vsText: {
    fontSize: 15,
  },
  commentsSection: {
    marginTop: 12,
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
