import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSkillLevels } from "@/lib/skill-levels";

interface DiscoverFiltersProps {
  sport: "tennis" | "padel";
  onSportChange: (sport: "tennis" | "padel") => void;
  selectedLevels: string[];
  onToggleLevel: (level: string) => void;
}

const SPORTS: { key: "tennis" | "padel"; label: string }[] = [
  { key: "tennis", label: "Tennis" },
  { key: "padel", label: "Padel" },
];

export function DiscoverFilters({
  sport,
  onSportChange,
  selectedLevels,
  onToggleLevel,
}: DiscoverFiltersProps) {
  const scheme = useColorScheme();
  const accent = sport === "padel" ? colors.accentOrange : colors.accentGreen;
  const levels = getSkillLevels(sport);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.sportTrack,
          {
            backgroundColor: semanticColors.systemGray6[scheme],
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        {SPORTS.map((option) => {
          const active = option.key === sport;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSportChange(option.key)}
              style={[styles.sportButton, active && { backgroundColor: accent }]}
            >
              <Text
                style={[
                  styles.sportLabel,
                  { color: active ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelsRow}>
        {levels.map((level) => {
          const active = selectedLevels.includes(level.value);
          return (
            <Pressable
              key={level.value}
              onPress={() => onToggleLevel(level.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? accent : semanticColors.systemGray6[scheme],
                  borderColor: active ? accent : semanticColors.borderColor[scheme],
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
                ]}
              >
                {level.displayName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sportTrack: {
    flexDirection: "row",
    marginHorizontal: spacing.horizontal,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 3,
  },
  sportButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: radii.md - 3,
  },
  sportLabel: {
    fontWeight: "700",
    fontSize: 13.5,
  },
  levelsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: spacing.horizontal,
  },
  chip: {
    borderRadius: 11,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipLabel: {
    fontWeight: "700",
    fontSize: 12.5,
  },
});
