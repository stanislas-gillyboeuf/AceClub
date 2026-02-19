import { View, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useCreateIntentFormStore,
  isTimeValid,
} from "@/store/create-intent-form";
import { colors, semanticColors, radii } from "@/constants/theme";

export default function Step2() {
  const scheme = useColorScheme();
  const date = useCreateIntentFormStore((s) => s.date);
  const time = useCreateIntentFormStore((s) => s.time);
  const setDate = useCreateIntentFormStore((s) => s.setDate);
  const setTime = useCreateIntentFormStore((s) => s.setTime);

  const valid = isTimeValid(date, time);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
      >
        Quand êtes-vous disponible ?
      </Text>

      <View style={styles.pickersColumn}>
        <GlassView style={styles.pickerCard}>
          <Text
            style={[
              styles.pickerLabel,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
          >
            Date
          </Text>
          <DateTimePicker
            value={date}
            mode="date"
            display="compact"
            minimumDate={new Date()}
            onChange={(_, selected) => {
              if (selected) setDate(selected);
            }}
            accentColor={colors.accentGreen}
            themeVariant={scheme}
            locale="fr-FR"
          />
        </GlassView>

        <GlassView style={styles.pickerCard}>
          <Text
            style={[
              styles.pickerLabel,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
          >
            Heure
          </Text>
          <DateTimePicker
            value={time}
            mode="time"
            display="compact"
            minuteInterval={15}
            onChange={(_, selected) => {
              if (selected) setTime(selected);
            }}
            accentColor={colors.accentGreen}
            themeVariant={scheme}
            locale="fr-FR"
          />
        </GlassView>
      </View>

      {!valid && (
        <Text style={styles.errorText}>
          L'heure doit être au moins 1h dans le futur
        </Text>
      )}
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
  pickersColumn: {
    gap: 12,
  },
  pickerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    color: colors.red500,
  },
});
