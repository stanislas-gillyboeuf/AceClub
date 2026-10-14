import { View, Text, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import { formatAces } from "@/lib/format";
import type { UserLevel } from "@/types/level";

interface LevelProgressCardProps {
  level: UserLevel;
  showDetailIndicator?: boolean;
  onPress?: () => void;
}

export function LevelProgressCard({
  level,
  showDetailIndicator = false,
  onPress,
}: LevelProgressCardProps) {
  const scheme = useColorScheme();

  return (
    <Card onPress={onPress}>
      {/* Header: level title + badge */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.levelTitle,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
          >
            Niveau {level.level}
          </Text>
          <Text
            style={[
              styles.totalAces,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            {formatAces(level.totalAces)} Aces total
          </Text>
        </View>

        {/* Level badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: `${semanticColors.accentGreen[scheme]}26`, borderColor: semanticColors.accentGreen[scheme] },
          ]}
        >
          <View style={styles.badgeInner}>
            <Text style={[styles.badgeNumber, { color: semanticColors.accentGreen[scheme] }]}>{level.level}</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: semanticColors.skeleton[scheme],
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(level.progressPercent, 100)}%`, backgroundColor: semanticColors.accentGreen[scheme] },
            ]}
          />
        </View>

        <View style={styles.progressLabels}>
          <Text
            style={[
              styles.progressText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            {level.currentLevelAces}/{level.currentLevelAces + level.acesToNextLevel} Aces
          </Text>
          <Text style={[styles.nextLevelText, { color: semanticColors.accentGreen[scheme] }]}>
            Niveau {level.level + 1}
          </Text>
        </View>
      </View>

      {/* Detail indicator */}
      {showDetailIndicator && (
        <View style={styles.detailSection}>
          <View
            style={[
              styles.divider,
              { backgroundColor: semanticColors.divider[scheme] },
            ]}
          />
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, { color: semanticColors.accentGreen[scheme] }]}>Voir ma progression</Text>
            <ChevronRight
              size={14}
              color={`${semanticColors.accentGreen[scheme]}99`}
              strokeWidth={2.5}
            />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    gap: 4,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  totalAces: {
    fontSize: 15,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  progressSection: {
    gap: 8,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: 12,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
  },
  nextLevelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailSection: {
    marginTop: 16,
    gap: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
