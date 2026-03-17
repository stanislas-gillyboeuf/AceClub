import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { spacing } from "@/constants/theme";

export function WeekDateStripSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width={100} height={13} />
        <Skeleton width={20} height={20} borderRadius={4} />
      </View>

      <View style={styles.daysRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.dayCell}>
            <Skeleton width={20} height={11} />
            <Skeleton width={18} height={17} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 12,
    paddingBottom: 16,
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 52,
    borderRadius: 12,
    gap: 2,
  },
});
