import { View, Text, StyleSheet } from "react-native";
import { Clock, CheckCircle2 } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import {
  getChallengeProgressPercent,
  getChallengeStatusColor,
  getChallengeTimeRemaining,
  getDifficultyColor,
  getDifficultyLabel,
} from "@/lib/progression";
import { formatAces } from "@/lib/format";
import type { Challenge } from "@/types/challenge";

interface ChallengeRowProps {
  challenge: Challenge;
}

export function ChallengeRow({ challenge }: ChallengeRowProps) {
  const scheme = useColorScheme();
  const progress = getChallengeProgressPercent(
    challenge.currentValue,
    challenge.targetValue
  );
  const statusColor = getChallengeStatusColor(challenge.status, colors.accentGreen);
  const difficultyColor = getDifficultyColor(challenge.difficulty);
  const isCompleted = challenge.status === "completed";
  const isExpired = challenge.status === "expired";
  const timeRemaining = getChallengeTimeRemaining(challenge.endDate);

  return (
    <Card style={isCompleted || isExpired ? { opacity: 0.7 } : undefined}>
      {/* Header: title + reward */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.title,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
            numberOfLines={1}
          >
            {challenge.title}
          </Text>
          <View style={styles.tags}>
            <View
              style={[styles.difficultyTag, { backgroundColor: `${difficultyColor}1A` }]}
            >
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {getDifficultyLabel(challenge.difficulty)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>
            +{formatAces(challenge.reward)} Aces
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text
        style={[
          styles.description,
          { color: semanticColors.labelSecondary[scheme] },
        ]}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} color={statusColor} height={8} />
        <View style={styles.progressLabels}>
          <Text
            style={[
              styles.progressText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            {challenge.currentValue}/{challenge.targetValue}
          </Text>
          {isCompleted ? (
            <View style={styles.completedRow}>
              <CheckCircle2 size={14} color="#34C759" />
              <Text style={styles.completedText}>Complété</Text>
            </View>
          ) : timeRemaining && !isExpired ? (
            <View style={styles.timeRow}>
              <Clock size={12} color={semanticColors.labelSecondary[scheme]} />
              <Text
                style={[
                  styles.timeText,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {timeRemaining}
              </Text>
            </View>
          ) : isExpired ? (
            <Text style={[styles.timeText, { color: "#8E8E93" }]}>Expiré</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  tags: {
    flexDirection: "row",
    gap: 6,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rewardBadge: {
    backgroundColor: "#34C7591A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34C759",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  progressSection: {
    gap: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#34C759",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
});
