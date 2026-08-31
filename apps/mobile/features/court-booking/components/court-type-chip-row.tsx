import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "../theme";
import type { CourtTypeFilter } from "../lib/court-filters";

interface CourtTypeChipRowProps {
  filters: CourtTypeFilter[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function CourtTypeChipRow({ filters, selectedKey, onSelect }: CourtTypeChipRowProps) {
  const scheme = useColorScheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((filter) => {
        const active = filter.key === selectedKey;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onSelect(filter.key)}
            style={[
              styles.chip,
              {
                borderColor: active ? bookingGreen.bright : semanticColors.borderColor[scheme],
                backgroundColor: active ? bookingGreen.bright : semanticColors.systemGray6[scheme],
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? bookingGreen.onBright : semanticColors.labelSecondary[scheme] }]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: 11,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  label: {
    fontWeight: "700",
    fontSize: 12.5,
  },
});
