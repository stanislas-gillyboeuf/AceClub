import { useState } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii } from "@/constants/theme";
import { formatShortDate, formatTime } from "@/lib/format";

interface EventDateRangeFieldProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  scheme: "light" | "dark";
  minimumStartDate?: Date;
}

export function EventDateRangeField({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  scheme,
  minimumStartDate,
}: EventDateRangeFieldProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  return (
    <GlassView style={styles.container}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
        DATES
      </Text>

      <DateRow
        label="Début"
        date={startDate}
        onChange={onStartDateChange}
        minimumDate={minimumStartDate}
        showPicker={showStartPicker}
        setShowPicker={setShowStartPicker}
        scheme={scheme}
      />

      <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

      <DateRow
        label="Fin"
        date={endDate}
        onChange={onEndDateChange}
        minimumDate={startDate}
        showPicker={showEndPicker}
        setShowPicker={setShowEndPicker}
        scheme={scheme}
      />
    </GlassView>
  );
}

interface DateRowProps {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  scheme: "light" | "dark";
}

function DateRow({ label, date, onChange, minimumDate, showPicker, setShowPicker, scheme }: DateRowProps) {
  if (Platform.OS === "ios") {
    return (
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme] }]}>
          {label}
        </Text>
        <DateTimePicker
          value={date}
          mode="datetime"
          display="compact"
          onChange={(_, d) => d && onChange(d)}
          minimumDate={minimumDate}
          locale="fr-FR"
          accentColor={colors.accentGreen}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable onPress={() => setShowPicker(true)} style={styles.row}>
        <Text style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme] }]}>
          {label}
        </Text>
        <Text style={[styles.rowValue, { color: semanticColors.labelSecondary[scheme] }]}>
          {formatShortDate(date.toISOString())} · {formatTime(date.toISOString())}
        </Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) onChange(d);
          }}
          minimumDate={minimumDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
