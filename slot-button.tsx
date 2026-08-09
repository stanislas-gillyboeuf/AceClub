import { Pressable, Text, StyleSheet } from "react-native";
import { colors, semanticColors, radii } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { AvailabilitySlot } from "@/types/court";

interface SlotButtonProps {
  slot: AvailabilitySlot;
  selected: boolean;
  onPress: () => void;
}

export function SlotButton({ slot, selected, onPress }: SlotButtonProps) {
  const scheme = useColorScheme();
  const label = new Date(slot.startTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      disabled={!slot.available}
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        {
          backgroundColor: selected
            ? colors.accentGreen
            : semanticColors.systemGray6[scheme],
          opacity: slot.available ? 1 : 0.35,
        },
        pressed && slot.available && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? "#FFFFFF" : semanticColors.labelPrimary[scheme],
            textDecorationLine: slot.available ? "none" : "line-through",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: radii.sm,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "23%",
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
