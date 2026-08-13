import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { courtColors } from "../theme";
import type { CourtTypeFilter } from "../lib/court-filters";

interface CourtTypeChipRowProps {
  filters: CourtTypeFilter[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function CourtTypeChipRow({ filters, selectedKey, onSelect }: CourtTypeChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((filter) => {
        const active = filter.key === selectedKey;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onSelect(filter.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{filter.label}</Text>
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
    borderColor: courtColors.line,
    backgroundColor: courtColors.ink700,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  label: {
    fontWeight: "700",
    fontSize: 12.5,
    color: courtColors.chalkDim,
  },
  labelActive: {
    color: courtColors.ink900,
  },
});
