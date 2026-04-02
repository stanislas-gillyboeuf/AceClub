import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { radii, semanticColors, spacing } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import { useMemo } from "react";

export function MatchEmptyDay() {
  const scheme = useColorScheme();

  const cardStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderColor: semanticColors.borderColor[scheme],
      borderRadius: radii.md,
      backgroundColor: semanticColors.cardBackground[scheme],
    }),
    [scheme]
  );

  return (
    <View style={styles.container}>
      <EmptyState
        icon="Swords"
        title="Pas de match aujourd'hui"
        description="Planifie un match et lance-toi !"
        containerStyle={cardStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
  },
});
