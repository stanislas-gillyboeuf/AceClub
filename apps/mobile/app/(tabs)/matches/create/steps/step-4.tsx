import { useMemo, useCallback } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useCreateMatchFormStore,
  getAvailableSlots,
} from "@/store/create-match-form";
import { TimeSlotGrid } from "../components/time-slot-grid";
import { colors, semanticColors, radii } from "@/constants/theme";

const formatDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function Step4() {
  const scheme = useColorScheme();
  const scheduledDate = useCreateMatchFormStore((s) => s.scheduledDate);
  const selectedSlot = useCreateMatchFormStore((s) => s.selectedSlot);
  const isPast = useCreateMatchFormStore((s) => s.isPast);
  const setScheduledDate = useCreateMatchFormStore((s) => s.setScheduledDate);
  const setSelectedSlot = useCreateMatchFormStore((s) => s.setSelectedSlot);
  const setIsPast = useCreateMatchFormStore((s) => s.setIsPast);

  const isAndroid = Platform.OS === "android";

  const openDatePicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: scheduledDate,
      mode: "date",
      minimumDate: isPast ? undefined : new Date(),
      maximumDate: isPast ? new Date() : undefined,
      onChange: (_, date) => {
        if (date) setScheduledDate(date);
      },
    });
  }, [scheduledDate, setScheduledDate, isPast]);

  const availableSlots = useMemo(
    () => getAvailableSlots(scheduledDate, isPast),
    [scheduledDate, isPast]
  );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        {isPast ? "Match passé" : "Quand jouer ?"}
      </Text>

      <View style={styles.segmented}>
        <Pressable
          onPress={() => setIsPast(false)}
          style={[
            styles.segmentedItem,
            !isPast && {
              backgroundColor: colors.accentGreen,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentedLabel,
              {
                color: !isPast
                  ? "#fff"
                  : semanticColors.labelSecondary[scheme],
              },
            ]}
          >
            À venir
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsPast(true)}
          style={[
            styles.segmentedItem,
            isPast && {
              backgroundColor: colors.accentGreen,
            },
          ]}
        >
          <Text
            style={[
              styles.segmentedLabel,
              {
                color: isPast
                  ? "#fff"
                  : semanticColors.labelSecondary[scheme],
              },
            ]}
          >
            Passé
          </Text>
        </Pressable>
      </View>

      {isAndroid ? (
        <Pressable onPress={openDatePicker}>
          <GlassView style={styles.datePickerCard}>
            <Text style={[styles.dateValue, { color: semanticColors.labelPrimary[scheme] }]}>
              {formatDate(scheduledDate)}
            </Text>
          </GlassView>
        </Pressable>
      ) : (
        <GlassView style={styles.datePickerCard}>
          <DateTimePicker
            key={isPast ? "past" : "future"}
            value={scheduledDate}
            mode="date"
            display="compact"
            minimumDate={isPast ? undefined : new Date()}
            maximumDate={isPast ? new Date() : undefined}
            onChange={(_, date) => {
              if (date) setScheduledDate(date);
            }}
            accentColor={colors.accentGreen}
            themeVariant={scheme}
            locale="fr-FR"
          />
        </GlassView>
      )}

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
  dateValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeSection: {
    gap: 10,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  segmented: {
    flexDirection: "row",
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#8E8E93",
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentedLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
