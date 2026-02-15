import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import {
  getStreakColor,
  formatStreakWeeks,
  formatMultiplier,
} from "@/lib/progression";
import type { UserStreak } from "@/types/streak";

interface StreakCardProps {
  streak: UserStreak;
}

export function StreakCard({ streak }: StreakCardProps) {
  const scheme = useColorScheme();
  const streakColor = getStreakColor(streak.currentStreak);
  const multiplierText = formatMultiplier(streak.multiplier);

  return (
    <Card>
      <View style={styles.row}>
        {/* Left: flame + current streak */}
        <View style={styles.left}>
          <View style={[styles.iconContainer, { backgroundColor: `${streakColor}1A` }]}>
            <Flame size={22} color={streakColor} fill={streak.currentStreak > 0 ? streakColor : "transparent"} />
          </View>
          <View style={styles.streakInfo}>
            <View style={styles.streakValueRow}>
              <Text
                style={[
                  styles.streakValue,
                  { color: semanticColors.labelPrimary[scheme] },
                ]}
              >
                {formatStreakWeeks(streak.currentStreak)}
              </Text>
              {multiplierText && (
                <View style={[styles.multiplierBadge, { backgroundColor: `${streakColor}1A` }]}>
                  <Text style={[styles.multiplierText, { color: streakColor }]}>
                    {multiplierText}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Série en cours
            </Text>
          </View>
        </View>

        {/* Right: longest streak */}
        <View style={styles.right}>
          <Text
            style={[
              styles.longestValue,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
          >
            {streak.longestStreak}
          </Text>
          <Text
            style={[
              styles.label,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            Record
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  streakInfo: {
    gap: 2,
  },
  streakValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakValue: {
    fontSize: 17,
    fontWeight: "600",
  },
  multiplierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  longestValue: {
    fontSize: 17,
    fontWeight: "600",
  },
});
