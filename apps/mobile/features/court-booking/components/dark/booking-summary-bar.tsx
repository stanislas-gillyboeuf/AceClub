import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
import type { CourtSlot } from "@/types/court";

interface BookingSummaryBarProps {
  courtName: string;
  slot: CourtSlot;
  onBook: () => void;
  isLoading: boolean;
}

export function BookingSummaryBar({ courtName, slot, onBook, isLoading }: BookingSummaryBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.court}>{courtName}</Text>
        <Text style={styles.time}>{slot.startTime}</Text>
      </View>
      <Pressable
        onPress={onBook}
        disabled={isLoading}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={courtColors.ink} />
        ) : (
          <Text style={styles.buttonText}>Réserver</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 14,
    backgroundColor: courtColors.ink2,
    borderTopWidth: 1,
    borderTopColor: courtColors.pineLine,
  },
  summary: {
    flex: 1,
  },
  court: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 15,
    color: courtColors.chalk,
  },
  time: {
    fontFamily: courtFonts.mono,
    fontSize: 13,
    color: courtColors.mist,
    marginTop: 2,
  },
  button: {
    backgroundColor: courtColors.ball,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 26,
    minWidth: 110,
    alignItems: "center",
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 15,
    color: courtColors.ink,
  },
});
