import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing, radii } from "@/constants/theme";
import { SENSATION_MAP } from "@/features/matches/constants/sensations";
import type { MatchFeedback } from "@/types/match";

interface FeedbackCardProps {
  feedback: MatchFeedback;
  onEdit: () => void;
}

function getSensation(key: string) {
  return SENSATION_MAP[key] ?? { emoji: "\u{2753}", label: key };
}

export function FeedbackCard({ feedback, onEdit }: FeedbackCardProps) {
  const scheme = useColorScheme();
  const sensation = getSensation(feedback.sensation);

  return (
    <GlassView style={styles.container}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        MES SENSATIONS
      </Text>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <GlassView style={styles.feedbackRow}>
          <Text style={styles.emoji}>{sensation.emoji}</Text>
          <View style={styles.feedbackInfo}>
            <Text style={[styles.sensationLabel, { color: semanticColors.labelPrimary[scheme] }]}>
              {sensation.label}
            </Text>
            {feedback.comment && (
              <Text
                style={[styles.commentText, { color: semanticColors.labelSecondary[scheme] }]}
                numberOfLines={2}
              >
                {feedback.comment}
              </Text>
            )}
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
  emoji: {
    fontSize: 32,
  },
  feedbackInfo: {
    flex: 1,
    gap: 2,
  },
  sensationLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentText: {
    fontSize: 12,
  },
});
