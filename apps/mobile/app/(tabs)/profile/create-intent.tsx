import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { X } from "lucide-react-native";

import { useCreateMatchIntent } from "@/hooks/use-match-intent";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SectionCard } from "@/components/ui/section-card";
import { RadioGroup } from "@/components/ui/radio-group";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchIntentType } from "@/types/match-intent";

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2h" },
] as const;

const TYPE_OPTIONS: { value: MatchIntentType; label: string }[] = [
  { value: "match", label: "Match" },
  { value: "training", label: "Entraînement" },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CreateIntent() {
  const scheme = useColorScheme();
  const router = useRouter();
  const createIntent = useCreateMatchIntent();

  // Form state
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === "ios");
  const [duration, setDuration] = useState(60);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [type, setType] = useState<MatchIntentType>("match");
  const [description, setDescription] = useState("");

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selected) setDate((prev) => {
      const next = new Date(selected);
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
      return next;
    });
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selected) setDate((prev) => {
      const next = new Date(prev);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      return next;
    });
  };

  const handleSubmit = () => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    createIntent.mutate(
      {
        date: dateStr,
        time: timeStr,
        duration,
        type,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => router.dismiss(),
        onError: () => Alert.alert("Erreur", "Impossible de créer la dispo."),
      }
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nouvelle dispo",
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()} hitSlop={8}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
      >
        {/* Date */}
        <SectionCard title="Date">
          {Platform.OS === "android" && (
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.pickerRow}
            >
              <Text style={[styles.pickerValue, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatDate(date)}
              </Text>
            </Pressable>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={today}
              onChange={handleDateChange}
              locale="fr-FR"
            />
          )}
        </SectionCard>

        {/* Time */}
        <SectionCard title="Heure">
          {Platform.OS === "android" && (
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.pickerRow}
            >
              <Text style={[styles.pickerValue, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatTime(date)}
              </Text>
            </Pressable>
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === "ios" ? "compact" : "default"}
              minuteInterval={15}
              onChange={handleTimeChange}
              locale="fr-FR"
            />
          )}
        </SectionCard>

        {/* Duration */}
        <SectionCard title="Durée">
          <View style={styles.pillRow}>
            {DURATION_OPTIONS.map((opt) => {
              const selected = opt.value === duration;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setDuration(opt.value)}
                  style={[
                    styles.pill,
                    selected
                      ? styles.pillSelected
                      : {
                          backgroundColor:
                            scheme === "dark" ? "#1C1C1E" : "#F2F2F7",
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selected
                        ? styles.pillTextSelected
                        : { color: semanticColors.labelPrimary[scheme] },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        {/* Type */}
        <SectionCard title="Type">
          <RadioGroup
            options={TYPE_OPTIONS}
            selected={type}
            onSelect={setType}
          />
        </SectionCard>

        {/* Description */}
        <SectionCard title="Description (optionnel)">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Je cherche un partenaire de niveau intermédiaire..."
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            multiline
            numberOfLines={3}
            style={[
              styles.textArea,
              {
                color: semanticColors.labelPrimary[scheme],
                backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F2F2F7",
              },
            ]}
          />
        </SectionCard>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={createIntent.isPending}
          style={[
            styles.submitButton,
            { opacity: createIntent.isPending ? 0.6 : 1 },
          ]}
        >
          {createIntent.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Créer la dispo</Text>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.horizontal,
    gap: 16,
    paddingTop: 8,
  },
  pickerRow: {
    paddingVertical: 4,
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: colors.accentGreen,
  },
  pillText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  textArea: {
    minHeight: 80,
    borderRadius: radii.sm,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  submitButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
