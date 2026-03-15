import { View, Text, Pressable, StyleSheet } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { TennisBall } from "@/features/matches/components/feedback/tennis-ball";

interface FeedbackCtaProps {
  onEffort: () => void;
  onComment: () => void;
  hasEffort?: boolean;
  hasComment?: boolean;
}

export function FeedbackCta({ onEffort, onComment, hasEffort, hasComment }: FeedbackCtaProps) {
  const scheme = useColorScheme();
  const iconColor = semanticColors.labelTertiary[scheme];

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onEffort}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <GlassView style={styles.cardInner}>
          <TennisBall size={32} color={iconColor} />
          <Text style={[styles.cardTitle, { color: semanticColors.labelPrimary[scheme] }]}>
            Effort
          </Text>
          <Text style={[styles.cardSubtitle, { color: semanticColors.labelSecondary[scheme] }]}>
            {hasEffort ? "Modifier" : "Évaluer"}
          </Text>
        </GlassView>
      </Pressable>

      <Pressable
        onPress={onComment}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <GlassView style={styles.cardInner}>
          <MessageSquare size={28} color={iconColor} strokeWidth={1.8} />
          <Text style={[styles.cardTitle, { color: semanticColors.labelPrimary[scheme] }]}>
            Commentaire
          </Text>
          <Text style={[styles.cardSubtitle, { color: semanticColors.labelSecondary[scheme] }]}>
            {hasComment ? "Modifier" : "Ajouter"}
          </Text>
        </GlassView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  cardInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: spacing.card,
    borderRadius: radii.md,
    minHeight: 110,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
  },
});
