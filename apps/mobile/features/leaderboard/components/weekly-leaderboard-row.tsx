import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import { isTopRank, getRankColor } from "@/lib/progression";
import { formatAces } from "@/lib/format";
import type { WeeklyLeaderboardEntry } from "@/types/leaderboard";

interface WeeklyLeaderboardRowProps {
  entry: WeeklyLeaderboardEntry;
}

export function WeeklyLeaderboardRow({ entry }: WeeklyLeaderboardRowProps) {
  const scheme = useColorScheme();
  const top = isTopRank(entry.rank);
  const rankColor = getRankColor(entry.rank);

  return (
    <View
      style={[
        styles.row,
        top && {
          backgroundColor: `${rankColor}0D`,
        },
      ]}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} size={32} />

      {/* Avatar */}
      <Avatar
        imageUrl={entry.user.image}
        name={entry.user.name}
        size={40}
      />

      {/* Name */}
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
          numberOfLines={1}
        >
          {entry.user.name}
        </Text>
      </View>

      {/* Weekly aces */}
      <Text
        style={[
          styles.aces,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        +{formatAces(entry.weeklyAces)} Aces
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  aces: {
    fontSize: 14,
    fontWeight: "600",
  },
});
