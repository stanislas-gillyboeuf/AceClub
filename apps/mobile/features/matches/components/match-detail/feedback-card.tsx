import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchFeedback } from "@/types/match";

interface FeedbackCardProps {
  feedback: MatchFeedback;
  onEdit: () => void;
}

const SENSATION_MAP: Record<string, { emoji: string; label: string }> = {
  great: { emoji: "\u{1F929}", label: "Super !" },
  good: { emoji: "\u{1F60A}", label: "Bien" },
  neutral: { emoji: "\u{1F610}", label: "Neutre" },
  bad: { emoji: "\u{1F61E}", label: "Pas top" },
  terrible: { emoji: "\u{1F62D}", label: "Terrible" },
};

function getSensation(key: string) {
  return SENSATION_MAP[key] ?? { emoji: "\u{2753}", label: key };
}

export function FeedbackCard({ feedback, onEdit }: FeedbackCardProps) {
  const scheme = useColorScheme();
  const sensation = getSensation(feedback.sensation);

  return (
    <View style={[styles.container, {
      backgroundColor: semanticColors.cardBackground[scheme],
      borderColor: semanticColors.borderColor[scheme],
    }]}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        MES SENSATIONS
      </Text>

      <Pressable
        onPress={onEdit}
        style={[styles.feedbackRow, {
          backgroundColor: scheme === "light" ? "#F2F2F7" : "#1C1C1E",
        }]}
      >
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
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
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
