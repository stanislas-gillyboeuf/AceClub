import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateIntentFormStore } from "@/store/create-intent-form";
import { DurationTile } from "../components/duration-tile";
import { semanticColors } from "@/constants/theme";

const DURATION_OPTIONS = [60, 90, 120, 180, 300];

export default function Step3() {
  const scheme = useColorScheme();
  const duration = useCreateIntentFormStore((s) => s.duration);
  const setDuration = useCreateIntentFormStore((s) => s.setDuration);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
      >
        Combien de temps ?
      </Text>

      <View style={styles.grid}>
        {DURATION_OPTIONS.map((minutes) => (
          <View key={minutes} style={styles.gridItem}>
            <DurationTile
              minutes={minutes}
              isSelected={duration === minutes}
              onPress={() => setDuration(minutes)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
  },
});
