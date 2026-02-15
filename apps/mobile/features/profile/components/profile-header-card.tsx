import { View, Text, StyleSheet } from "react-native";
import { Trophy, TrendingUp, Clock } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { User, UserPreferences } from "@/types/user";
import type { UserLevel } from "@/types/level";
import type { Sport } from "@/types/common";
import { getSkillLevelDisplayName } from "@/lib/skill-levels";

interface ProfileHeaderCardProps {
  user: User;
  preferences: UserPreferences | null;
  level: UserLevel | null;
  matchStats: {
    totalMatches: number;
    winRate: number;
    totalPlaytimeMinutes: number;
  };
}

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
}

export function ProfileHeaderCard({
  user,
  preferences,
  level,
  matchStats,
}: ProfileHeaderCardProps) {
  const scheme = useColorScheme();

  const skillLabel = preferences
    ? getSkillLevelDisplayName(preferences.skillLevel, preferences.sport as Sport)
    : null;

  const subtitle = [
    skillLabel,
    preferences?.organizationName,
  ]
    .filter(Boolean)
    .join(" - ");

  const progressPercent = level ? Math.min(level.progressPercent * 100, 100) : 0;

  return (
    <Card>
      {/* User info row */}
      <View style={styles.userRow}>
        <Avatar imageUrl={user.image} name={user.name} size={72} />
        <View style={styles.userInfo}>
          <Text
            style={[styles.userName, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.userSubtitle, { color: semanticColors.labelSecondary[scheme] }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Level progress */}
      {level && (
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={[styles.levelLabel, { color: semanticColors.labelSecondary[scheme] }]}>
              Niveau {level.level}
            </Text>
            <Text style={[styles.levelPercent, { color: semanticColors.labelSecondary[scheme] }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: scheme === "dark" ? "#3A3A3C" : "#E5E5EA" },
            ]}
          >
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}

      {/* Stats row */}
      <View
        style={[
          styles.statsRow,
          { borderTopColor: semanticColors.divider[scheme] },
        ]}
      >
        <View style={styles.statItem}>
          <Trophy size={16} color={colors.accentOrange} strokeWidth={2} />
          <Text style={[styles.statValue, { color: semanticColors.labelPrimary[scheme] }]}>
            {matchStats.totalMatches}
          </Text>
          <Text style={[styles.statLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            Matchs totaux
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: semanticColors.divider[scheme] }]}
        />
        <View style={styles.statItem}>
          <TrendingUp size={16} color={colors.accentGreen} strokeWidth={2} />
          <Text style={[styles.statValue, { color: semanticColors.labelPrimary[scheme] }]}>
            {matchStats.winRate}%
          </Text>
          <Text style={[styles.statLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            Taux de victoire
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: semanticColors.divider[scheme] }]}
        />
        <View style={styles.statItem}>
          <Clock size={16} color={semanticColors.labelSecondary[scheme]} strokeWidth={2} />
          <Text style={[styles.statValue, { color: semanticColors.labelPrimary[scheme] }]}>
            {formatPlaytime(matchStats.totalPlaytimeMinutes)}
          </Text>
          <Text style={[styles.statLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            Temps de jeu
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
  },
  userSubtitle: {
    fontSize: 15,
  },
  levelSection: {
    gap: 6,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  levelPercent: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentGreen,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
});
