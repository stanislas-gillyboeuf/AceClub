import { View, Pressable, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { CourtSlot } from "@/types/court";

interface SlotGridProps {
  slots: CourtSlot[];
  selectedSlot: CourtSlot | null;
  onSelect: (slot: CourtSlot) => void;
}

export function SlotGrid({ slots, selectedSlot, onSelect }: SlotGridProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;
        const disabled = !slot.available;
        return (
          <View key={slot.startTime} style={styles.gridItem}>
            <Pressable
              onPress={() => onSelect(slot)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isSelected
                    ? colors.accentGreen
                    : semanticColors.cardBackground[scheme],
                  borderColor: isSelected
                    ? colors.accentGreen
                    : semanticColors.borderColor[scheme],
                },
                pressed && !disabled && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: disabled
                      ? semanticColors.labelTertiary[scheme]
                      : isSelected
                        ? "#FFFFFF"
                        : semanticColors.labelPrimary[scheme],
                  },
                ]}
              >
                {slot.startTime}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: spacing.horizontal,
  },
  gridItem: {
    width: "22%",
  },
  tile: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
