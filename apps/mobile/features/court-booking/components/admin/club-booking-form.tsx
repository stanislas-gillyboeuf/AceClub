import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { courtColors, courtFontMono } from "../../theme";
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
    <View style={styles.container}>
      <Text style={styles.title}>Réserver pour le club</Text>

      <View style={styles.timeRow}>
        <TimeField
          label="Début"
          time={startTime}
          onChange={setStartTime}
          show={showAndroidPicker === "start"}
          onPress={() => setShowAndroidPicker("start")}
          onDismiss={() => setShowAndroidPicker(null)}
        />
        <TimeField
          label="Fin"
          time={endTime}
          onChange={setEndTime}
          show={showAndroidPicker === "end"}
          onPress={() => setShowAndroidPicker("end")}
          onDismiss={() => setShowAndroidPicker(null)}
        />
      </View>

      <Text style={styles.label}>MOTIF</Text>
      <View style={styles.suggestions}>
        {PURPOSE_SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setPurpose(s)}
            style={[styles.suggestion, purpose === s && styles.suggestionActive]}
          >
            <Text style={[styles.suggestionText, purpose === s && styles.suggestionTextActive]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Ex : Cours collectif débutants"
        placeholderTextColor={courtColors.chalkDim}
        style={styles.input}
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
}

function TimeField({ label, time, onChange, show, onPress, onDismiss }: TimeFieldProps) {
  if (Platform.OS === "ios") {
    return (
      <View style={styles.timeField}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <DateTimePicker
          value={time}
          mode="time"
          display="compact"
          onChange={(_, d) => d && onChange(d)}
          locale="fr-FR"
          accentColor={courtColors.chartreuse}
          themeVariant="dark"
        />
      </View>
    );
  }

  return (
    <View style={styles.timeField}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Pressable onPress={onPress} style={styles.androidTimeButton}>
        <Text style={styles.androidTimeText}>{formatTime(time.toISOString())}</Text>
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
    backgroundColor: courtColors.ink700,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: courtColors.line,
    padding: 18,
    gap: 14,
  },
  title: {
    fontWeight: "800",
    fontSize: 20,
    color: courtColors.chalk,
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
    color: courtColors.chalkDim,
  },
  androidTimeButton: {
    backgroundColor: courtColors.ink900,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  androidTimeText: {
    fontFamily: courtFontMono,
    fontSize: 15,
    color: courtColors.chalk,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestion: {
    backgroundColor: courtColors.ink900,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: courtColors.line,
  },
  suggestionActive: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  suggestionText: {
    fontWeight: "500",
    fontSize: 13,
    color: courtColors.chalk,
  },
  suggestionTextActive: {
    color: courtColors.ink900,
  },
  input: {
    backgroundColor: courtColors.ink900,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: courtColors.chalk,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
