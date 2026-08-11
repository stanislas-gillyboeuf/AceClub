import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import Button from "@/components/ui/button";
import type { CourtSlot } from "@/types/court";

interface BookingSummaryBarProps {
  courtName: string;
  slot: CourtSlot;
  onBook: () => void;
  isLoading: boolean;
}

export function BookingSummaryBar({ courtName, slot, onBook, isLoading }: BookingSummaryBarProps) {
  const scheme = useColorScheme();

  return (
    <View
      style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
    >
      <View style={styles.summary}>
        <Text style={[styles.court, { color: semanticColors.labelPrimary[scheme] }]}>
          {courtName}
        </Text>
        <Text style={[styles.time, { color: semanticColors.labelSecondary[scheme] }]}>
          {slot.startTime}
        </Text>
      </View>
      <Button label="Réserver" onPress={onBook} loading={isLoading} fullWidth={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  summary: {
    flex: 1,
  },
  court: {
    fontSize: 15,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    marginTop: 2,
  },
});
