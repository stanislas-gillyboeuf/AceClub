import { View, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { radii, spacing } from "@/constants/theme";
import { Skeleton } from "@/components/ui/skeleton";

export function MatchRequestSkeleton() {
  return (
    <GlassView style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.textContainer}>
          <Skeleton width={120} height={16} borderRadius={4} />
          <Skeleton width={160} height={13} borderRadius={4} />
        </View>
      </View>

      <View style={styles.details}>
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width={140} height={14} borderRadius={4} />
        <Skeleton width={80} height={14} borderRadius={4} />
      </View>

      <View style={styles.actions}>
        <Skeleton width="48%" height={40} borderRadius={radii.sm} />
        <Skeleton width="48%" height={40} borderRadius={radii.sm} />
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  details: {
    gap: 6,
    paddingLeft: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
