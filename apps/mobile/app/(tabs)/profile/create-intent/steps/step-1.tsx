import { View, Text, StyleSheet } from "react-native";
import { Swords, Dumbbell } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateIntentFormStore } from "@/store/create-intent-form";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { colors, semanticColors } from "@/constants/theme";
import type { MatchIntentType } from "@/types/match-intent";

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

export default function Step1() {
  const scheme = useColorScheme();
  const intentType = useCreateIntentFormStore((s) => s.intentType);
  const setIntentType = useCreateIntentFormStore((s) => s.setIntentType);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
      >
        Quel type d'activité ?
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
