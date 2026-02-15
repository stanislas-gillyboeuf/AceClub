import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { radii, semanticColors, spacing } from "@/constants/theme";
import { Skeleton } from "@/components/ui/skeleton";

export function MatchRequestSkeleton() {
  const scheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.requesterInfo}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={styles.textContainer}>
            <Skeleton width={120} height={16} borderRadius={4} />
            <Skeleton width={160} height={13} borderRadius={4} />
          </View>
        </View>
        <Skeleton width={64} height={24} borderRadius={radii.xl} />
      </View>

      <View style={styles.actions}>
        <Skeleton width="100%" height={40} borderRadius={radii.sm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requesterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
  },
});
