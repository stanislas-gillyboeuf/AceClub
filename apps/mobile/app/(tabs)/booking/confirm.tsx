import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { courtColors, courtFontMono } from "@/features/court-booking/theme";
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Réserver · {isPadel ? "Padel" : "Tennis"}</Text>
      <Text style={styles.title}>{`${hour}h–${hour + 1}h`}</Text>
      <Text style={styles.subtitle}>
        {params.courtName} · {params.courtTag} · {params.dateLabel}
      </Text>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {conflict && (
        <View style={styles.conflictBanner}>
          <Text style={styles.conflictText}>
            Ce créneau vient d&apos;être réservé par un autre joueur entre-temps.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.conflictButton}>
            <Text style={styles.conflictButtonText}>Choisir un autre créneau</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.playersHeader}>
        <Text style={styles.playersLabel}>{isPadel ? "Avec qui (4 joueurs au total)" : "Avec qui"}</Text>
        {isPadel && <Text style={styles.optionalTag}>optionnel</Text>}
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
        <View style={styles.deadlineNote}>
          <View style={styles.deadlineDot} />
          <Text style={styles.deadlineText}>
            Tu peux compléter l&apos;équipe plus tard. Si elle n&apos;est pas complète{" "}
            <Text style={styles.deadlineBold}>avant {deadlineHour}h</Text>, le court est automatiquement
            libéré.
          </Text>
        </View>
      )}

      <Text style={styles.cancellationNote}>{cancellationText}</Text>

      <View style={styles.actions}>
        <Pressable onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={!canConfirm || createBooking.isPending}
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
        >
          <Text style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}>
            {createBooking.isPending ? "…" : "Confirmer"}
          </Text>
        </Pressable>
      </View>
      {!canConfirm && <Text style={styles.confirmHint}>Désigne ton partenaire pour confirmer</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink800,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  eyebrow: {
    fontFamily: courtFontMono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: courtColors.chartreuseDim,
    marginBottom: 6,
  },
  title: {
    fontWeight: "800",
    fontSize: 22,
    color: courtColors.chalk,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: courtColors.chalkDim,
    marginBottom: 18,
  },
  errorBanner: {
    backgroundColor: "rgba(224,103,58,0.1)",
    borderWidth: 1,
    borderColor: courtColors.rustDim,
    borderRadius: 10,
    padding: 13,
    marginBottom: 14,
  },
  errorText: {
    color: courtColors.rust,
    fontWeight: "600",
    fontSize: 12,
  },
  conflictBanner: {
    gap: 12,
    backgroundColor: "rgba(224,103,58,0.1)",
    borderWidth: 1,
    borderColor: courtColors.rustDim,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  conflictText: {
    color: courtColors.rust,
    fontWeight: "600",
    fontSize: 12.5,
    lineHeight: 17,
  },
  conflictButton: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
  },
  conflictButtonText: {
    color: courtColors.chalk,
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
    fontFamily: courtFontMono,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: courtColors.chalkDim,
  },
  optionalTag: {
    fontSize: 10.5,
    color: courtColors.chalkFaint,
  },
  slot: {
    marginBottom: 10,
  },
  deadlineNote: {
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
    backgroundColor: "rgba(227,178,60,0.08)",
    borderWidth: 1,
    borderColor: courtColors.amberDim,
    borderRadius: 11,
    padding: 12,
    marginTop: 14,
  },
  deadlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: courtColors.amber,
    marginTop: 4,
  },
  deadlineText: {
    flex: 1,
    fontSize: 11.5,
    color: courtColors.chalkDim,
    lineHeight: 16,
  },
  deadlineBold: {
    color: courtColors.amber,
    fontWeight: "700",
  },
  cancellationNote: {
    fontSize: 11,
    color: courtColors.chalkFaint,
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
    borderColor: courtColors.line,
    alignItems: "center",
  },
  cancelButtonText: {
    color: courtColors.chalkDim,
    fontWeight: "700",
    fontSize: 13.5,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: courtColors.chartreuse,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
  },
  confirmButtonText: {
    color: courtColors.ink900,
    fontWeight: "700",
    fontSize: 13.5,
  },
  confirmButtonTextDisabled: {
    color: courtColors.chalkFaint,
  },
  confirmHint: {
    fontFamily: courtFontMono,
    fontSize: 10.5,
    color: courtColors.chalkFaint,
    textAlign: "center",
    marginTop: 8,
  },
});
