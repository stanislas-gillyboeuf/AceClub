import { View, StyleSheet } from "react-native";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function MatchRowSkeleton() {
  return (
    <CardSkeleton>
      <View style={styles.headerRow}>
        <View style={styles.timeRow}>
          <Skeleton width={14} height={14} borderRadius={7} />
          <Skeleton width={50} height={14} />
        </View>
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
      <View style={styles.playersRow}>
        <View style={styles.playerRow}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={80} height={14} />
        </View>
        <Skeleton width={20} height={14} />
        <View style={styles.playerRow}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={80} height={14} />
        </View>
        <Skeleton width={50} height={22} />
      </View>
    </CardSkeleton>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
});
