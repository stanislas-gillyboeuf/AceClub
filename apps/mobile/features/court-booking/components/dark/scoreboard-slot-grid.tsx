import { View, Pressable, Text, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
import type { CourtSlot } from "@/types/court";

interface ScoreboardSlotGridProps {
  slots: CourtSlot[];
  selectedSlot: CourtSlot | null;
  onSelect: (slot: CourtSlot) => void;
}

export function ScoreboardSlotGrid({ slots, selectedSlot, onSelect }: ScoreboardSlotGridProps) {
  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;
        const disabled = !slot.available;
        return (
          <View key={slot.startTime} style={styles.item}>
            <Pressable
              onPress={() => onSelect(slot)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isSelected ? courtColors.ball : courtColors.ink2,
                  borderColor: isSelected ? courtColors.ball : courtColors.pineLine,
                },
                pressed && !disabled && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.time,
                  {
                    color: disabled
                      ? courtColors.mist
                      : isSelected
                        ? courtColors.ink
                        : courtColors.chalk,
                  },
                ]}
              >
                {slot.startTime}
              </Text>
              {disabled && slot.bookedAsClub && (
                <View style={styles.clubBadge}>
                  <Text style={styles.clubBadgeText}>CLUB</Text>
                </View>
              )}
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
    paddingHorizontal: 20,
  },
  item: {
    width: "22%",
  },
  tile: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  time: {
    fontFamily: courtFonts.mono,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  clubBadge: {
    backgroundColor: courtColors.clay,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  clubBadgeText: {
    fontFamily: courtFonts.monoSemiBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
    color: courtColors.chalk,
  },
});
