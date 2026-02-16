import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import { isTopRank, getRankColor } from "@/lib/progression";
import { formatAces } from "@/lib/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

export function LeaderboardRow({ entry }: LeaderboardRowProps) {
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

      {/* Name + level */}
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
        <Text
          style={[
            styles.level,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
        >
          Niv. {entry.level}
        </Text>
      </View>

      {/* Right: aces + streak */}
      <View style={styles.stats}>
        <Text
          style={[
            styles.aces,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
        >
          {formatAces(entry.aces)} Aces
        </Text>
        {entry.streak > 0 && (
          <View style={styles.streakRow}>
            <Flame size={12} color="#FF9500" fill="#FF9500" />
            <Text style={styles.streakText}>{entry.streak}</Text>
          </View>
        )}
      </View>
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
  level: {
    fontSize: 12,
  },
  stats: {
    alignItems: "flex-end",
    gap: 2,
  },
  aces: {
    fontSize: 14,
    fontWeight: "600",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FF9500",
  },
});
