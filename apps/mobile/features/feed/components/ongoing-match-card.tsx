import { View, Text, Pressable, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { BadgePill } from "@/components/ui/badge-pill";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import {
  formatMatchScore,
  getHomeParticipant,
  getAwayParticipant,
} from "@/lib/format";
import type { MatchWithParticipants, MatchParticipant } from "@/types/match";

interface OngoingMatchCardProps {
  match: MatchWithParticipants;
  onPress?: () => void;
}

function PlayerColumn({ participant }: { participant?: MatchParticipant }) {
  return (
    <View style={styles.playerColumn}>
      <Avatar
        imageUrl={participant?.user?.image}
        name={participant?.user?.name ?? "?"}
        size={32}
      />
      <Text style={styles.playerName} numberOfLines={1}>
        {participant?.user?.name ?? "N/A"}
      </Text>
    </View>
  );
}

export function OngoingMatchCard({ match, onPress }: OngoingMatchCardProps) {
  const scheme = useColorScheme();
  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);
  const setCount = match.sets?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: `${colors.accentOrange}4D`,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.header}>
        <BadgePill label="En cours" variant="warning" />
        <Text
          style={[
            styles.setLabel,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
        >
          Set {setCount}
        </Text>
      </View>
      <View style={styles.playersRow}>
        <PlayerColumn participant={home} />

        <Text
          style={[
            styles.score,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
        >
          {formatMatchScore(match)}
        </Text>

        <PlayerColumn participant={away} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 2,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setLabel: {
    fontSize: 12,
  },
  playersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  playerColumn: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  playerName: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
    textOverflow: "clip",
    overflow: "hidden",
    width: "100%",
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
