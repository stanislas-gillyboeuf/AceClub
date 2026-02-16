import { View, Text, StyleSheet } from "react-native";
import { getRankColor, isTopRank } from "@/lib/progression";

interface RankBadgeProps {
  rank: number;
  size?: number;
}

export function RankBadge({ rank, size = 32 }: RankBadgeProps) {
  const color = getRankColor(rank);
  const top = isTopRank(rank);
  const fontSize = size * 0.44;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: top ? `${color}26` : "transparent",
          borderWidth: top ? 2 : 0,
          borderColor: top ? color : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color: top ? color : "#8E8E93",
            fontWeight: top ? "700" : "600",
          },
        ]}
      >
        {rank}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {},
});
