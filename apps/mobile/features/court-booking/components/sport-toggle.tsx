import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const scheme = useColorScheme();

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: semanticColors.systemGray6[scheme], borderColor: semanticColors.borderColor[scheme] },
      ]}
    >
      {OPTIONS.map((option) => {
        const active = option.key === sport;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.button, active && { backgroundColor: colors.accentGreen }]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.white : semanticColors.labelSecondary[scheme] },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 9,
  },
  label: {
    fontWeight: "700",
    fontSize: 13.5,
  },
});
