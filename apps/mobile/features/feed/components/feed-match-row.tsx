import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Heart, MessageCircle } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { PlayerView } from "@/components/ui/player-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToggleLike } from "@/hooks/use-match";
import { colors, semanticColors, radii } from "@/constants/theme";
import {
  formatMatchDate,
  formatMatchDuration,
  formatRelativeTime,
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
  const { mutate: toggleLike } = useToggleLike();

  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);

  const currentUserWon =
    match.participants.find((p) => p.userId === currentUserId)?.isWinner ??
    false;

  const structuredScore = getStructuredMatchScore(match);
  const duration = formatMatchDuration(match);
  const date = formatMatchDate(match);

  const photos = match.photos ?? [];
  const totalComments = match.comments?.length ?? 0;
  const relativeTime = formatRelativeTime(
    match.finishedAt ?? match.startedAt ?? match.createdAt
  );

  return (
    <Card onPress={onPress}>
      {/* Player Header */}
      <View style={styles.playerHeader}>
        <View style={styles.playerHeaderLeft}>
          <Avatar
            imageUrl={home?.user?.image}
            name={home?.user?.name ?? "?"}
            size={40}
          />
          <View style={styles.playerHeaderText}>
            <Text
              style={[
                styles.playerNames,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
              numberOfLines={1}
            >
              {home?.user?.name ?? "N/A"} vs {away?.user?.name ?? "N/A"}
            </Text>
            <Text
              style={[
                styles.playerMeta,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              {date}
              {duration ? ` · ${duration}` : ""}
            </Text>
          </View>
        </View>
        <BadgePill
          label={currentUserWon ? "Victoire" : "Défaite"}
          variant={currentUserWon ? "success" : "danger"}
        />
      </View>

      {/* Match photos */}
      {photos.length === 1 && (
        <Image
          source={{ uri: photos[0].imageUrl }}
          style={styles.singlePhoto}
          contentFit="cover"
          transition={200}
        />
      )}
      {photos.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosScroll}
          contentContainerStyle={styles.photosScrollContent}
        >
          {photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.imageUrl }}
              style={styles.scrollPhoto}
              contentFit="cover"
              transition={200}
            />
          ))}
        </ScrollView>
      )}

      {/* Set-by-set scores */}
      {structuredScore ? (
        <View style={styles.scoresSection}>
          <SetScoresView
            score={structuredScore}
            homeName={home?.user?.name ?? "N/A"}
            awayName={away?.user?.name ?? "N/A"}
            homeIsWinner={home?.isWinner}
            size="compact"
          />
        </View>
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

      {/* Action Bar */}
      <View
        style={[
          styles.actionBar,
          { borderTopColor: semanticColors.divider[scheme] },
        ]}
      >
        <View style={styles.actionBarLeft}>
          <Pressable
            onPress={() => toggleLike(match.id)}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Heart
              size={18}
              color={
                match.hasLiked
                  ? colors.red500
                  : semanticColors.labelSecondary[scheme]
              }
              fill={match.hasLiked ? colors.red500 : "transparent"}
              strokeWidth={2}
            />
            {match.likesCount > 0 && (
              <Text
                style={[
                  styles.actionCount,
                  {
                    color: match.hasLiked
                      ? colors.red500
                      : semanticColors.labelSecondary[scheme],
                  },
                ]}
              >
                {match.likesCount}
              </Text>
            )}
          </Pressable>

          <View style={styles.actionButton}>
            <MessageCircle
              size={18}
              color={semanticColors.labelSecondary[scheme]}
              strokeWidth={2}
            />
            {totalComments > 0 && (
              <Text
                style={[
                  styles.actionCount,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {totalComments}
              </Text>
            )}
          </View>
        </View>

        <Text
          style={[
            styles.relativeTime,
            { color: semanticColors.labelTertiary[scheme] },
          ]}
        >
          {relativeTime}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  playerHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  playerHeaderText: {
    flex: 1,
  },
  playerNames: {
    fontSize: 16,
    fontWeight: "700",
  },
  playerMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  singlePhoto: {
    width: "100%",
    height: 200,
    borderRadius: radii.lg,
    marginBottom: 16,
  },
  photosScroll: {
    marginHorizontal: -16,
    marginBottom: 16,
  },
  photosScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  scrollPhoto: {
    width: 240,
    height: 200,
    borderRadius: radii.lg,
  },
  scoresSection: {
    marginBottom: 16,
  },
  playersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  vsText: {
    fontSize: 15,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  actionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  relativeTime: {
    fontSize: 13,
  },
});
