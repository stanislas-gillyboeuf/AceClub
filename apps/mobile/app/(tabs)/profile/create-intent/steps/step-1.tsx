import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Swords, Dumbbell, CircleDot } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePreferences } from "@/hooks/use-user";
import { useCreateIntentFormStore } from "@/store/create-intent-form";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { colors, semanticColors } from "@/constants/theme";
import type { MatchIntentType } from "@/types/match-intent";
import type { Sport } from "@/types/common";

const ACTIVITY_TYPES: {
  value: MatchIntentType;
  label: string;
  icon: (selected: boolean) => React.ReactNode;
}[] = [
  {
    value: "match",
    label: "Match",
    icon: (selected) => (
      <Swords
        size={28}
        color={selected ? colors.accentGreen : "#8E8E93"}
        strokeWidth={1.8}
      />
    ),
  },
  {
    value: "training",
    label: "Entraînement",
    icon: (selected) => (
      <Dumbbell
        size={28}
        color={selected ? colors.accentGreen : "#8E8E93"}
        strokeWidth={1.8}
      />
    ),
  },
];

const SPORTS: { value: Sport; label: string }[] = [
  { value: "tennis", label: "Tennis" },
  { value: "padel", label: "Padel" },
];

export default function Step1() {
  const scheme = useColorScheme();
  const { data: preferences } = usePreferences();
  const intentType = useCreateIntentFormStore((s) => s.intentType);
  const setIntentType = useCreateIntentFormStore((s) => s.setIntentType);
  const sport = useCreateIntentFormStore((s) => s.sport);
  const setSport = useCreateIntentFormStore((s) => s.setSport);

  // A player who only declared one sport isn't shown a choice — default straight to it.
  const playsBothSports = !!preferences?.sport && !!preferences?.secondarySport;

  useEffect(() => {
    if (preferences?.sport) {
      setSport(preferences.sport as Sport);
    }
    // Only apply once, when preferences first load — the player can still change it manually after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.sport]);

  return (
    <View style={styles.container}>
      {playsBothSports && (
        <>
          <Text
            style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
          >
            Pour quel sport ?
          </Text>
          <View style={styles.tilesRow}>
            {SPORTS.map((option) => (
              <SelectableTile
                key={option.value}
                icon={
                  <CircleDot
                    size={28}
                    color={sport === option.value ? colors.accentGreen : "#8E8E93"}
                    strokeWidth={1.8}
                  />
                }
                label={option.label}
                isSelected={sport === option.value}
                onPress={() => setSport(option.value)}
                iconSize={72}
              />
            ))}
          </View>
        </>
      )}

      <Text
        style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
      >
        Quel type d&apos;activité ?
      </Text>

      <View style={styles.tilesRow}>
        {ACTIVITY_TYPES.map((type) => (
          <SelectableTile
            key={type.value}
            icon={type.icon(intentType === type.value)}
            label={type.label}
            isSelected={intentType === type.value}
            onPress={() => setIntentType(type.value)}
            iconSize={72}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  tilesRow: {
    flexDirection: "row",
    gap: 14,
  },
});
