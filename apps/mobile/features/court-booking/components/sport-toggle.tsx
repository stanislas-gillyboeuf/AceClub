import { View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors } from "../theme";
import type { CourtSport } from "@/types/court";

interface SportToggleProps {
  sport: CourtSport;
  onChange: (sport: CourtSport) => void;
}

const OPTIONS: { key: CourtSport; label: string }[] = [
  { key: "tennis", label: "Tennis" },
  { key: "padel", label: "Padel" },
];

export function SportToggle({ sport, onChange }: SportToggleProps) {
  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const active = option.key === sport;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderRadius: 12,
    padding: 4,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 9,
  },
  buttonActive: {
    backgroundColor: courtColors.chartreuse,
  },
  label: {
    fontWeight: "700",
    fontSize: 13.5,
    color: courtColors.chalkDim,
  },
  labelActive: {
    color: courtColors.ink900,
  },
});
