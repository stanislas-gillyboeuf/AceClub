import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SectionCard } from "@/components/ui/section-card";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { semanticColors, radii } from "@/constants/theme";

export type Gender = "male" | "female" | "other";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
];

interface ProfileInfoSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  gender: Gender | null;
  onGenderChange: (gender: Gender) => void;
  dateOfBirth: Date;
  hasDateOfBirth: boolean;
  onDateOfBirthChange: (date: Date) => void;
  minBirthdate: Date;
  maxBirthdate: Date;
  scheme: "light" | "dark";
}

export function ProfileInfoSection({
  name,
  onNameChange,
  gender,
  onGenderChange,
  dateOfBirth,
  hasDateOfBirth,
  onDateOfBirthChange,
  minBirthdate,
  maxBirthdate,
  scheme,
}: ProfileInfoSectionProps) {
  return (
    <>
      <SectionCard title="Informations personnelles">
        <FormField
          label="Nom complet"
          value={name}
          onChangeText={onNameChange}
          placeholder="Votre nom"
          autoCapitalize="words"
        />
      </SectionCard>

      <SectionCard title="Genre">
        <RadioGroup<Gender>
          options={GENDER_OPTIONS}
          selected={gender}
          onSelect={onGenderChange}
        />
      </SectionCard>

      <SectionCard title="Date de naissance">
        <BirthdatePicker
          value={dateOfBirth}
          onChange={onDateOfBirthChange}
          hasValue={hasDateOfBirth}
          minDate={minBirthdate}
          maxDate={maxBirthdate}
          scheme={scheme}
        />
      </SectionCard>
    </>
  );
}

interface BirthdatePickerProps {
  value: Date;
  hasValue: boolean;
  onChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  scheme: "light" | "dark";
}

function BirthdatePicker({ value, hasValue, onChange, minDate, maxDate, scheme }: BirthdatePickerProps) {
  if (Platform.OS === "ios") {
    return (
      <View style={styles.datePickerRow}>
        <DateTimePicker
          value={value}
          mode="date"
          display="spinner"
          onChange={(_, selectedDate) => {
            if (selectedDate) onChange(selectedDate);
          }}
          maximumDate={maxDate}
          minimumDate={minDate}
          locale="fr-FR"
          style={{ height: 150 }}
        />
      </View>
    );
  }
  return (
    <AndroidBirthdatePicker
      value={value}
      hasValue={hasValue}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      scheme={scheme}
    />
  );
}

function AndroidBirthdatePicker({ value, hasValue, onChange, minDate, maxDate, scheme }: BirthdatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={({ pressed }) => [
          styles.dateButton,
          { backgroundColor: semanticColors.cardBackground[scheme] },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={{ color: semanticColors.labelPrimary[scheme], fontSize: 16 }}>
          {hasValue
            ? value.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
            : "Sélectionner une date"}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) onChange(selectedDate);
          }}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  datePickerRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
});
