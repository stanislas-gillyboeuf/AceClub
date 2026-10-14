import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii, spacing } from "@/constants/theme";
import { useMyOrganizations } from "@/hooks/use-organization";
import { useAllCourtsForOrg, useCreateCourt, useUpdateCourt } from "@/hooks/use-court";
import Button from "@/components/ui/button";
import {
  SLOT_DURATIONS,
  type CourtSport,
  type CourtSurface,
  type CourtCancellationPolicy,
  type CourtAccessPolicy,
} from "@/types/court";

const SPORT_OPTIONS: { value: CourtSport; label: string }[] = [
  { value: "tennis", label: "Tennis" },
  { value: "padel", label: "Padel" },
];

const SURFACE_OPTIONS: { value: CourtSurface; label: string }[] = [
  { value: "clay", label: "Terre battue" },
  { value: "hard", label: "Dur" },
  { value: "grass", label: "Gazon" },
  { value: "carpet", label: "Moquette" },
];

const CANCELLATION_OPTIONS: { value: CourtCancellationPolicy; label: string }[] = [
  { value: "anytime", label: "À tout moment" },
  { value: "window", label: "X heures avant" },
  { value: "disabled", label: "Désactivée" },
];

const ACCESS_OPTIONS: { value: CourtAccessPolicy; label: string }[] = [
  { value: "members_only", label: "Adhérents uniquement" },
  { value: "open", label: "Ouvert à tous" },
];

export default function CourtFormScreen() {
  const scheme = useColorScheme();
  const { courtId } = useLocalSearchParams<{ courtId?: string }>();
  const isEditing = !!courtId;

  const { data: orgs } = useMyOrganizations();
  const organizationId = orgs?.[0]?.id;
  const { data: courts } = useAllCourtsForOrg(organizationId);
  const existing = useMemo(() => courts?.find((c) => c.id === courtId), [courts, courtId]);

  const createCourt = useCreateCourt();
  const updateCourt = useUpdateCourt();

  const [name, setName] = useState("");
  const [sport, setSport] = useState<CourtSport>("tennis");
  const [surface, setSurface] = useState<CourtSurface | undefined>(undefined);
  const [indoor, setIndoor] = useState(false);
  const [pricePerHour, setPricePerHour] = useState("");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(60);
  const [cancellationPolicy, setCancellationPolicy] = useState<CourtCancellationPolicy>("anytime");
  const [cancellationWindowHours, setCancellationWindowHours] = useState("");
  const [accessPolicy, setAccessPolicy] = useState<CourtAccessPolicy>("members_only");

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setSport(existing.sport);
    setSurface(existing.surface ?? undefined);
    setIndoor(existing.indoor);
    setPricePerHour(existing.pricePerHour != null ? String(existing.pricePerHour) : "");
    setSlotDurationMinutes(existing.slotDurationMinutes);
    setCancellationPolicy(existing.cancellationPolicy);
    setCancellationWindowHours(
      existing.cancellationWindowHours != null ? String(existing.cancellationWindowHours) : "",
    );
    setAccessPolicy(existing.accessPolicy);
  }, [existing]);

  const isValid =
    name.trim().length > 0 &&
    (cancellationPolicy !== "window" || cancellationWindowHours.trim().length > 0);

  const handleSubmit = () => {
    if (!organizationId) return;

    const windowHours =
      cancellationPolicy === "window" ? Number(cancellationWindowHours) : undefined;

    if (isEditing && courtId) {
      updateCourt.mutate(
        {
          courtId,
          name: name.trim(),
          sport,
          surface: sport === "tennis" ? surface : undefined,
          indoor,
          pricePerHour: pricePerHour.trim() ? Number(pricePerHour) : null,
          slotDurationMinutes: slotDurationMinutes as (typeof SLOT_DURATIONS)[number],
          cancellationPolicy,
          cancellationWindowHours: windowHours,
          accessPolicy,
        },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Erreur", "Impossible de mettre à jour ce terrain."),
        },
      );
    } else {
      createCourt.mutate(
        {
          organizationId,
          name: name.trim(),
          sport,
          surface: sport === "tennis" ? surface : undefined,
          indoor,
          pricePerHour: pricePerHour.trim() ? Number(pricePerHour) : undefined,
          slotDurationMinutes: slotDurationMinutes as (typeof SLOT_DURATIONS)[number],
          cancellationPolicy,
          cancellationWindowHours: windowHours,
          accessPolicy,
        },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Erreur", "Impossible de créer ce terrain."),
        },
      );
    }
  };

  const isSaving = createCourt.isPending || updateCourt.isPending;

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? "Modifier le terrain" : "Nouveau terrain" }} />
      <ScrollView
        style={[styles.screen, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentContainerStyle={styles.content}
      >
        <Field label="NOM" scheme={scheme}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex : Court 1"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            style={[styles.input, inputThemeStyle(scheme)]}
          />
        </Field>

        <Field label="SPORT" scheme={scheme}>
          <SegmentedOptions options={SPORT_OPTIONS} value={sport} onChange={setSport} scheme={scheme} />
        </Field>

        {sport === "tennis" && (
          <Field label="SURFACE" scheme={scheme}>
            <SegmentedOptions
              options={SURFACE_OPTIONS}
              value={surface}
              onChange={setSurface}
              scheme={scheme}
            />
          </Field>
        )}

        <Field label="EMPLACEMENT" scheme={scheme}>
          <SegmentedOptions
            options={[
              { value: false, label: "Extérieur" },
              { value: true, label: "Intérieur" },
            ]}
            value={indoor}
            onChange={setIndoor}
            scheme={scheme}
          />
        </Field>

        <Field label="PRIX PAR HEURE (OPTIONNEL)" scheme={scheme}>
          <TextInput
            value={pricePerHour}
            onChangeText={setPricePerHour}
            placeholder="Ex : 20"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            keyboardType="numeric"
            style={[styles.input, inputThemeStyle(scheme)]}
          />
        </Field>

        <Field label="DURÉE DE CRÉNEAU" scheme={scheme}>
          <SegmentedOptions
            options={SLOT_DURATIONS.map((d) => ({ value: d, label: `${d} min` }))}
            value={slotDurationMinutes}
            onChange={setSlotDurationMinutes}
            scheme={scheme}
          />
        </Field>

        <Field label="RÈGLE D'ANNULATION" scheme={scheme}>
          <SegmentedOptions
            options={CANCELLATION_OPTIONS}
            value={cancellationPolicy}
            onChange={setCancellationPolicy}
            scheme={scheme}
          />
          {cancellationPolicy === "window" && (
            <TextInput
              value={cancellationWindowHours}
              onChangeText={setCancellationWindowHours}
              placeholder="Nombre d'heures avant le créneau"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              keyboardType="numeric"
              style={[styles.input, inputThemeStyle(scheme), styles.inputSpaced]}
            />
          )}
        </Field>

        <Field label="ACCÈS" scheme={scheme}>
          <SegmentedOptions options={ACCESS_OPTIONS} value={accessPolicy} onChange={setAccessPolicy} scheme={scheme} />
        </Field>

        <View style={styles.actions}>
          <Button
            label={isEditing ? "Enregistrer" : "Créer le terrain"}
            onPress={handleSubmit}
            disabled={!isValid}
            loading={isSaving}
          />
        </View>
      </ScrollView>
    </>
  );
}

function inputThemeStyle(scheme: ColorScheme) {
  return {
    backgroundColor: semanticColors.cardBackground[scheme],
    borderColor: semanticColors.borderColor[scheme],
    color: semanticColors.labelPrimary[scheme],
  };
}

function Field({ label, scheme, children }: { label: string; scheme: ColorScheme; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: semanticColors.labelSecondary[scheme] }]}>{label}</Text>
      {children}
    </View>
  );
}

function SegmentedOptions<T>({
  options,
  value,
  onChange,
  scheme,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  scheme: ColorScheme;
}) {
  return (
    <View style={styles.optionsRow}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? semanticColors.accentGreen[scheme] : semanticColors.cardBackground[scheme],
                borderColor: isSelected ? semanticColors.accentGreen[scheme] : semanticColors.borderColor[scheme],
              },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: isSelected ? semanticColors.onAccentGreen[scheme] : semanticColors.labelPrimary[scheme] },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.horizontal,
    gap: 22,
    paddingBottom: 48,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  input: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputSpaced: {
    marginTop: 10,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderRadius: radii.sm - 1,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  optionText: {
    fontWeight: "600",
    fontSize: 13,
  },
  actions: {
    marginTop: 8,
  },
});
