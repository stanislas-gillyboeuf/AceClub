import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight, CalendarDays } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

interface DiscoverMoreCardProps {
  onPress: () => void;
}

export function DiscoverMoreCard({ onPress }: DiscoverMoreCardProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderColor: semanticColors.borderColor[scheme] },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
      ]}
    >
      <View style={styles.content}>
        <CalendarDays size={24} color={colors.accentGreen} strokeWidth={1.5} />
        <Text style={[styles.label, { color: semanticColors.labelPrimary[scheme] }]}>
          Voir plus
        </Text>
        <ChevronRight size={18} color={semanticColors.labelSecondary[scheme]} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 8,
    padding: spacing.card,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
