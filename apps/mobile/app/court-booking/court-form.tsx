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
import { courtColors } from "@/features/court-booking/theme";
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
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Field label="NOM">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex : Court 1"
            placeholderTextColor={courtColors.chalkDim}
            style={styles.input}
          />
        </Field>

        <Field label="SPORT">
          <SegmentedOptions options={SPORT_OPTIONS} value={sport} onChange={setSport} />
        </Field>

        {sport === "tennis" && (
          <Field label="SURFACE">
            <SegmentedOptions
              options={SURFACE_OPTIONS}
              value={surface}
              onChange={setSurface}
            />
          </Field>
        )}

        <Field label="EMPLACEMENT">
          <SegmentedOptions
            options={[
              { value: false, label: "Extérieur" },
              { value: true, label: "Intérieur" },
            ]}
            value={indoor}
            onChange={setIndoor}
          />
        </Field>

        <Field label="PRIX PAR HEURE (OPTIONNEL)">
          <TextInput
            value={pricePerHour}
            onChangeText={setPricePerHour}
            placeholder="Ex : 20"
            placeholderTextColor={courtColors.chalkDim}
            keyboardType="numeric"
            style={styles.input}
          />
        </Field>

        <Field label="DURÉE DE CRÉNEAU">
          <SegmentedOptions
            options={SLOT_DURATIONS.map((d) => ({ value: d, label: `${d} min` }))}
            value={slotDurationMinutes}
            onChange={setSlotDurationMinutes}
          />
        </Field>

        <Field label="RÈGLE D'ANNULATION">
          <SegmentedOptions
            options={CANCELLATION_OPTIONS}
            value={cancellationPolicy}
            onChange={setCancellationPolicy}
          />
          {cancellationPolicy === "window" && (
            <TextInput
              value={cancellationWindowHours}
              onChangeText={setCancellationWindowHours}
              placeholder="Nombre d'heures avant le créneau"
              placeholderTextColor={courtColors.chalkDim}
              keyboardType="numeric"
              style={[styles.input, styles.inputSpaced]}
            />
          )}
        </Field>

        <Field label="ACCÈS">
          <SegmentedOptions options={ACCESS_OPTIONS} value={accessPolicy} onChange={setAccessPolicy} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SegmentedOptions<T>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.optionsRow}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            style={[styles.option, isSelected && styles.optionActive]}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
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
    backgroundColor: courtColors.ink900,
  },
  content: {
    padding: 20,
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
    color: courtColors.chalkDim,
  },
  input: {
    backgroundColor: courtColors.ink700,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: courtColors.chalk,
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
    backgroundColor: courtColors.ink700,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  optionActive: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  optionText: {
    fontWeight: "600",
    fontSize: 13,
    color: courtColors.chalk,
  },
  optionTextActive: {
    color: courtColors.ink900,
  },
  actions: {
    marginTop: 8,
  },
});
