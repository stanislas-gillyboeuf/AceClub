import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useCreateMatchFormStore,
  getAvailableSlots,
} from "@/store/create-match-form";
import { TimeSlotGrid } from "../components/time-slot-grid";
import { colors, semanticColors, radii } from "@/constants/theme";

export default function Step4() {
  const scheme = useColorScheme();
  const scheduledDate = useCreateMatchFormStore((s) => s.scheduledDate);
  const selectedSlot = useCreateMatchFormStore((s) => s.selectedSlot);
  const setScheduledDate = useCreateMatchFormStore((s) => s.setScheduledDate);
  const setSelectedSlot = useCreateMatchFormStore((s) => s.setSelectedSlot);

  const availableSlots = useMemo(
    () => getAvailableSlots(scheduledDate),
    [scheduledDate]
  );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        Quand jouer ?
      </Text>

      <GlassView style={styles.datePickerCard}>
        <DateTimePicker
          value={scheduledDate}
          mode="date"
          display="compact"
          minimumDate={new Date()}
          onChange={(_, date) => {
            if (date) setScheduledDate(date);
          }}
          accentColor={colors.accentGreen}
          themeVariant={scheme}
          locale="fr-FR"
        />
      </GlassView>

      <View style={styles.timeSection}>
        <Text
          style={[
            styles.timeLabel,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
        >
          Heure
        </Text>

        <TimeSlotGrid
          slots={availableSlots}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />
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
  datePickerCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  timeSection: {
    gap: 10,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
