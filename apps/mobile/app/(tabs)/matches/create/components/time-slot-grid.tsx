import { View, Text, Pressable, StyleSheet } from "react-native";
import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { TimeSlot } from "@/store/create-match-form";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelect,
}: TimeSlotGridProps) {
  const scheme = useColorScheme();

  if (slots.length === 0) {
    return (
      <Text
        style={[
          styles.emptyText,
          { color: semanticColors.labelTertiary[scheme] },
        ]}
      >
        Aucun créneau disponible pour cette date
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlot?.id === slot.id;
        return (
          <Pressable
            key={slot.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(slot);
            }}
            style={({ pressed }) => [
              styles.chipWrapper,
              pressed && styles.pressed,
            ]}
          >
            <GlassView
              style={styles.chip}
              tintColor={isSelected ? colors.accentGreen : undefined}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? "#fff"
                      : semanticColors.labelPrimary[scheme],
                    fontWeight: isSelected ? "600" : "500",
                  },
                ]}
              >
                {slot.label}
              </Text>
            </GlassView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipWrapper: {
    width: "23%",
    borderRadius: radii.sm,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  chip: {
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
});
