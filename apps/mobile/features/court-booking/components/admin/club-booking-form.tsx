import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { semanticColors } from "@/constants/theme";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "../../theme";
import { formatTime } from "@/lib/format";
import Button from "@/components/ui/button";

const PURPOSE_SUGGESTIONS = ["Cours", "Tournoi", "Événement", "Maintenance"];

interface ClubBookingFormProps {
  date: Date;
  onSubmit: (params: { start: Date; end: Date; purpose: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function combine(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

export function ClubBookingForm({ date, onSubmit, onCancel, isLoading }: ClubBookingFormProps) {
  const scheme = useColorScheme();
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(date);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [purpose, setPurpose] = useState("");
  const [showAndroidPicker, setShowAndroidPicker] = useState<"start" | "end" | null>(null);

  const isValid = endTime.getTime() > startTime.getTime() && purpose.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      start: combine(date, startTime),
      end: combine(date, endTime),
      purpose: purpose.trim(),
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.cardBackground[scheme], borderColor: semanticColors.borderColor[scheme] },
      ]}
    >
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>Réserver pour le club</Text>

      <View style={styles.timeRow}>
        <TimeField
          label="Début"
          time={startTime}
          onChange={setStartTime}
          show={showAndroidPicker === "start"}
          onPress={() => setShowAndroidPicker("start")}
          onDismiss={() => setShowAndroidPicker(null)}
          scheme={scheme}
        />
        <TimeField
          label="Fin"
          time={endTime}
          onChange={setEndTime}
          show={showAndroidPicker === "end"}
          onPress={() => setShowAndroidPicker("end")}
          onDismiss={() => setShowAndroidPicker(null)}
          scheme={scheme}
        />
      </View>

      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>MOTIF</Text>
      <View style={styles.suggestions}>
        {PURPOSE_SUGGESTIONS.map((s) => {
          const active = purpose === s;
          return (
            <Pressable
              key={s}
              onPress={() => setPurpose(s)}
              style={[
                styles.suggestion,
                {
                  backgroundColor: active ? bookingGreen.bright : semanticColors.systemGray6[scheme],
                  borderColor: active ? bookingGreen.bright : semanticColors.borderColor[scheme],
                },
              ]}
            >
              <Text style={[styles.suggestionText, { color: active ? bookingGreen.onBright : semanticColors.labelPrimary[scheme] }]}>
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Ex : Cours collectif débutants"
        placeholderTextColor={semanticColors.labelTertiary[scheme]}
        style={[
          styles.input,
          {
            backgroundColor: semanticColors.systemGray6[scheme],
            borderColor: semanticColors.borderColor[scheme],
            color: semanticColors.labelPrimary[scheme],
          },
        ]}
      />

      <View style={styles.actions}>
        <Button label="Annuler" onPress={onCancel} variant="secondary" />
        <Button label="Réserver pour le club" onPress={handleSubmit} disabled={!isValid} loading={isLoading} />
      </View>
    </View>
  );
}

interface TimeFieldProps {
  label: string;
  time: Date;
  onChange: (date: Date) => void;
  show: boolean;
  onPress: () => void;
  onDismiss: () => void;
  scheme: ColorScheme;
}

function TimeField({ label, time, onChange, show, onPress, onDismiss, scheme }: TimeFieldProps) {
  if (Platform.OS === "ios") {
    return (
      <View style={styles.timeField}>
        <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>{label.toUpperCase()}</Text>
        <DateTimePicker
          value={time}
          mode="time"
          display="compact"
          onChange={(_, d) => d && onChange(d)}
          locale="fr-FR"
          accentColor={bookingGreen.bright}
          themeVariant={scheme}
        />
      </View>
    );
  }

  return (
    <View style={styles.timeField}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>{label.toUpperCase()}</Text>
      <Pressable
        onPress={onPress}
        style={[styles.androidTimeButton, { backgroundColor: semanticColors.systemGray6[scheme] }]}
      >
        <Text style={[styles.androidTimeText, { color: semanticColors.labelPrimary[scheme] }]}>
          {formatTime(time.toISOString())}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={time}
          mode="time"
          onChange={(_, d) => {
            onDismiss();
            if (d) onChange(d);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  title: {
    fontWeight: "800",
    fontSize: 20,
  },
  timeRow: {
    flexDirection: "row",
    gap: 16,
  },
  timeField: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  androidTimeButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  androidTimeText: {
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestion: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontWeight: "500",
    fontSize: 13,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
