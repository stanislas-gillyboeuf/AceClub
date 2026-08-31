import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "@/features/court-booking/theme";
import { PartnerSlotRow } from "@/features/court-booking/components/partner-slot-row";
import { PartnerSearchExpand } from "@/features/court-booking/components/partner-search-expand";
import { buildCancellationText } from "@/features/court-booking/lib/cancellation";
import { PADEL_TEAM_COMPLETION_WINDOW_HOURS } from "@/features/court-booking/lib/constants";
import { useCreateBooking, useFrequentPartners } from "@/hooks/use-court";
import { ApiError } from "@/lib/api";
import type { BookingParticipantInput, CourtCancellationPolicy, CourtSport } from "@/types/court";

interface Slot {
  label: string;
  userId?: string;
  guestName?: string;
  name: string | null;
}

export default function ConfirmBookingScreen() {
  const scheme = useColorScheme();
  const params = useLocalSearchParams<{
    organizationId: string;
    courtId: string;
    courtName: string;
    courtTag: string;
    sport: CourtSport;
    date: string;
    dateLabel: string;
    hour: string;
    cancellationPolicy: CourtCancellationPolicy;
    cancellationWindowHours?: string;
  }>();

  const hour = Number(params.hour);
  const isPadel = params.sport === "padel";
  const { data: frequentPartners } = useFrequentPartners();

  const [slots, setSlots] = useState<Slot[]>(() => {
    if (isPadel) {
      return [
        { label: "Joueur 2", name: null },
        { label: "Joueur 3", name: null },
        { label: "Joueur 4", name: null },
      ];
    }
    const first = frequentPartners?.[0];
    return [{ label: "Partenaire", name: first?.name ?? null, userId: first?.userId }];
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [conflict, setConflict] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createBooking = useCreateBooking();

  const usedIds = useMemo(() => new Set(slots.map((s) => s.userId).filter(Boolean)), [slots]);
  const suggestions = useMemo(
    () => (frequentPartners ?? []).filter((p) => !usedIds.has(p.userId)),
    [frequentPartners, usedIds],
  );

  const filledCount = slots.filter((s) => s.name).length;
  const canConfirm = isPadel || filledCount === 1;

  const cancellationText = buildCancellationText(
    params.cancellationPolicy ?? "anytime",
    params.cancellationWindowHours ? Number(params.cancellationWindowHours) : null,
  );

  const handleSelect = (index: number, selection: { userId?: string; guestName?: string; name: string }) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, userId: selection.userId, guestName: selection.guestName, name: selection.name } : s,
      ),
    );
    setExpandedIndex(null);
  };

  const handleRemove = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, userId: undefined, guestName: undefined, name: null } : s)),
    );
  };

  const handleConfirm = () => {
    setConflict(false);
    setErrorMessage(null);

    const participants: BookingParticipantInput[] = slots
      .filter((s) => s.name)
      .map((s) => (s.userId ? { userId: s.userId } : { guestName: s.guestName ?? s.name ?? undefined }));

    createBooking.mutate(
      { courtId: params.courtId, date: params.date, startTime: `${String(hour).padStart(2, "0")}:00`, participants },
      {
        onSuccess: (booking) => {
          router.replace(`/(tabs)/booking/ticket/${booking.id}?justBooked=1`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setConflict(true);
          } else if (error instanceof ApiError && (error.status === 403 || error.status === 400)) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Impossible de créer la réservation.");
          }
        },
      },
    );
  };

  const deadlineHour = Math.max(hour - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.eyebrow, { color: bookingGreen.dim }]}>Réserver · {isPadel ? "Padel" : "Tennis"}</Text>
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>{`${hour}h–${hour + 1}h`}</Text>
      <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
        {params.courtName} · {params.courtTag} · {params.dateLabel}
      </Text>

      {errorMessage && (
        <View style={[styles.errorBanner, { backgroundColor: `${colors.red500}14`, borderColor: `${colors.red500}55` }]}>
          <Text style={[styles.errorText, { color: colors.red500 }]}>{errorMessage}</Text>
        </View>
      )}

      {conflict && (
        <View style={[styles.conflictBanner, { backgroundColor: `${colors.red500}14`, borderColor: `${colors.red500}55` }]}>
          <Text style={[styles.conflictText, { color: colors.red500 }]}>
            Ce créneau vient d&apos;être réservé par un autre joueur entre-temps.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.conflictButton, { backgroundColor: semanticColors.cardBackground[scheme], borderColor: semanticColors.borderColor[scheme] }]}
          >
            <Text style={[styles.conflictButtonText, { color: semanticColors.labelPrimary[scheme] }]}>
              Choisir un autre créneau
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.playersHeader}>
        <Text style={[styles.playersLabel, { color: semanticColors.labelSecondary[scheme] }]}>
          {isPadel ? "Avec qui (4 joueurs au total)" : "Avec qui"}
        </Text>
        {isPadel && <Text style={[styles.optionalTag, { color: semanticColors.labelTertiary[scheme] }]}>optionnel</Text>}
      </View>

      {slots.map((slot, index) => (
        <View key={index} style={styles.slot}>
          <PartnerSlotRow
            label={slot.label}
            name={slot.name}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onRemove={() => handleRemove(index)}
          />
          {expandedIndex === index && (
            <PartnerSearchExpand
              organizationId={params.organizationId}
              suggestions={suggestions}
              onSelect={(selection) => handleSelect(index, selection)}
            />
          )}
        </View>
      ))}

      {isPadel && (
        <View style={[styles.deadlineNote, { backgroundColor: `${colors.accentOrange}14`, borderColor: `${colors.accentOrange}55` }]}>
          <View style={[styles.deadlineDot, { backgroundColor: colors.accentOrange }]} />
          <Text style={[styles.deadlineText, { color: semanticColors.labelSecondary[scheme] }]}>
            Tu peux compléter l&apos;équipe plus tard. Si elle n&apos;est pas complète{" "}
            <Text style={[styles.deadlineBold, { color: colors.accentOrange }]}>avant {deadlineHour}h</Text>, le court
            est automatiquement libéré.
          </Text>
        </View>
      )}

      <Text style={[styles.cancellationNote, { color: semanticColors.labelTertiary[scheme] }]}>{cancellationText}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.cancelButton, { borderColor: semanticColors.borderColor[scheme] }]}
        >
          <Text style={[styles.cancelButtonText, { color: semanticColors.labelSecondary[scheme] }]}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={!canConfirm || createBooking.isPending}
          style={[
            styles.confirmButton,
            canConfirm
              ? { backgroundColor: bookingGreen.bright }
              : { backgroundColor: semanticColors.systemGray6[scheme], borderWidth: 1, borderColor: semanticColors.borderColor[scheme] },
          ]}
        >
          <Text
            style={[
              styles.confirmButtonText,
              { color: canConfirm ? bookingGreen.onBright : semanticColors.labelTertiary[scheme] },
            ]}
          >
            {createBooking.isPending ? "…" : "Confirmer"}
          </Text>
        </Pressable>
      </View>
      {!canConfirm && (
        <Text style={[styles.confirmHint, { color: semanticColors.labelTertiary[scheme] }]}>
          Désigne ton partenaire pour confirmer
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontWeight: "800",
    fontSize: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 18,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    marginBottom: 14,
  },
  errorText: {
    fontWeight: "600",
    fontSize: 12,
  },
  conflictBanner: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  conflictText: {
    fontWeight: "600",
    fontSize: 12.5,
    lineHeight: 17,
  },
  conflictButton: {
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
  },
  conflictButtonText: {
    fontWeight: "700",
    fontSize: 12.5,
  },
  playersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  playersLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  optionalTag: {
    fontSize: 10.5,
  },
  slot: {
    marginBottom: 10,
  },
  deadlineNote: {
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
    marginTop: 14,
  },
  deadlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 4,
  },
  deadlineText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
  deadlineBold: {
    fontWeight: "700",
  },
  cancellationNote: {
    fontSize: 11,
    marginTop: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontWeight: "700",
    fontSize: 13.5,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
  },
  confirmButtonText: {
    fontWeight: "700",
    fontSize: 13.5,
  },
  confirmHint: {
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 8,
  },
});
