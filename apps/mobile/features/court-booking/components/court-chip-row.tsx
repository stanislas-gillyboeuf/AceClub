import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { Court } from "@/types/court";

interface CourtChipRowProps {
  courts: Court[];
  selectedCourtId: string | null;
  onSelect: (courtId: string) => void;
}

export function CourtChipRow({ courts, selectedCourtId, onSelect }: CourtChipRowProps) {
  const scheme = useColorScheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {courts.map((c) => {
        const isSelected = c.id === selectedCourtId;
        return (
          <Pressable key={c.id} onPress={() => onSelect(c.id)}>
            <GlassView
              style={styles.chip}
              tintColor={isSelected ? colors.accentGreen : undefined}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected
                      ? "#FFFFFF"
                      : semanticColors.labelPrimary[scheme],
                  },
                ]}
              >
                {c.name}
              </Text>
            </GlassView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: spacing.horizontal,
  },
  chip: {
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
