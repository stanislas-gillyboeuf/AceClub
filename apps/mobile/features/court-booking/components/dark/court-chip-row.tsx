import { ScrollView, StyleSheet } from "react-native";
import { DarkChip } from "./dark-chip";
import type { Court } from "@/types/court";

interface CourtChipRowProps {
  courts: Court[];
  selectedCourtId: string | null;
  onSelect: (courtId: string) => void;
}

export function CourtChipRow({ courts, selectedCourtId, onSelect }: CourtChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {courts.map((c) => (
        <DarkChip
          key={c.id}
          label={c.name}
          active={c.id === selectedCourtId}
          onPress={() => onSelect(c.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 20,
  },
});
