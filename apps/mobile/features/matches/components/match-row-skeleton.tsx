import { View, StyleSheet } from "react-native";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

function PlayerRowSkeleton({ nameWidth }: { nameWidth: number }) {
  return (
    <View style={styles.playerRow}>
      <View style={styles.nameSection}>
        <Skeleton width={6} height={6} borderRadius={3} />
        <Skeleton width={nameWidth} height={13} />
      </View>
      <View style={styles.setsSection}>
        <Skeleton width={24} height={15} />
        <Skeleton width={24} height={15} />
        <Skeleton width={24} height={15} />
      </View>
    </View>
  );
}

export function MatchRowSkeleton() {
  const scheme = useColorScheme();

  return (
    <CardSkeleton>
      <View style={styles.headerRow}>
        <View style={styles.timeRow}>
          <Skeleton width={14} height={14} borderRadius={7} />
          <Skeleton width={50} height={14} />
        </View>
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>

      <PlayerRowSkeleton nameWidth={90} />
      <View style={[styles.separator, { backgroundColor: semanticColors.borderColor[scheme] }]} />
      <PlayerRowSkeleton nameWidth={70} />
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
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  setsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
