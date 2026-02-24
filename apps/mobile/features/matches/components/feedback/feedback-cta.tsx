import { View, Text, Pressable, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing, radii } from "@/constants/theme";

interface FeedbackCtaProps {
  onPress: () => void;
}

export function FeedbackCta({ onPress }: FeedbackCtaProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassView style={styles.container}>
        <Text style={styles.emoji}>😊</Text>
        <View style={styles.info}>
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            Comment tu te sens ?
          </Text>
          <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
            Donne tes sensations sur ce match
          </Text>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.card,
    borderRadius: radii.md,
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
  },
});
