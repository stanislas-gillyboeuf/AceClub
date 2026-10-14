import { View, Text, StyleSheet } from "react-native";
import { Swords, Dumbbell } from "lucide-react-native";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { ActivityTile } from "../components/activity-tile";
import { semanticColors } from "@/constants/theme";

const ACTIVITY_TYPES = [
  {
    value: "match" as const,
    label: "Match",
    icon: (selected: boolean, scheme: ColorScheme) => (
      <Swords
        size={32}
        color={selected ? semanticColors.accentGreen[scheme] : "#8E8E93"}
        strokeWidth={1.8}
      />
    ),
  },
  {
    value: "training" as const,
    label: "Entraînement",
    icon: (selected: boolean, scheme: ColorScheme) => (
      <Dumbbell
        size={32}
        color={selected ? semanticColors.accentGreen[scheme] : "#8E8E93"}
        strokeWidth={1.8}
      />
    ),
  },
];

export default function Step1() {
  const scheme = useColorScheme();
  const matchType = useCreateMatchFormStore((s) => s.matchType);
  const setMatchType = useCreateMatchFormStore((s) => s.setMatchType);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        Quel type de rencontre ?
      </Text>

      <View style={styles.tilesRow}>
        {ACTIVITY_TYPES.map((type) => (
          <ActivityTile
            key={type.value}
            icon={type.icon(matchType === type.value, scheme)}
            label={type.label}
            isSelected={matchType === type.value}
            onPress={() => setMatchType(type.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  tilesRow: {
    flexDirection: "row",
    gap: 16,
  },
});
