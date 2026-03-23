import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing } from "@/constants/theme";
import { MatchRowSkeleton } from "./match-row-skeleton";

export function MatchListSkeleton() {
  const scheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <View style={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <MatchRowSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.horizontal,
    paddingTop: 16,
    gap: 12,
  },
});
