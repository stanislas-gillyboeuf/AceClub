import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { EFFORT_MAP } from "@/features/matches/constants/sensations";
import { TennisBall } from "@/features/matches/components/feedback/tennis-ball";
import type { MatchFeedback } from "@/types/match";

interface FeedbackCardProps {
  feedback: MatchFeedback;
  onEdit: () => void;
}

function getEffort(key: string) {
  return EFFORT_MAP[key] ?? { label: key, description: "", percentage: "—", value: 0 };
}

export function FeedbackCard({ feedback, onEdit }: FeedbackCardProps) {
  const scheme = useColorScheme();
  const effort = getEffort(feedback.sensation);

  return (
    <GlassView style={styles.container}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        SESSION
      </Text>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <GlassView style={styles.feedbackRow}>
          <TennisBall size={40} color={colors.accentGreen} />
          <View style={styles.feedbackInfo}>
            <Text style={[styles.effortLabel, { color: semanticColors.labelPrimary[scheme] }]}>
              {effort.label}
            </Text>
            <Text style={[styles.effortPercentage, { color: semanticColors.labelSecondary[scheme] }]}>
              Effort {effort.percentage}
            </Text>
          </View>
          <ChevronRight size={14} color={semanticColors.labelTertiary[scheme]} strokeWidth={2.5} />
        </GlassView>
      </Pressable>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.card,
    borderRadius: radii.md,
  },
  feedbackInfo: {
    flex: 1,
    gap: 2,
  },
  effortLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  effortPercentage: {
    fontSize: 13,
  },
});
