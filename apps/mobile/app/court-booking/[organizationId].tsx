import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { courtColors, courtFonts } from "@/features/court-booking/theme";
import {
  useCourts,
  useCourtAvailability,
  useCreateBooking,
  useCancelBooking,
  useBookForClub,
  useCourtBookingEnabled,
  useWeeklyQuota,
} from "@/hooks/use-court";
import { useActiveMemberRole } from "@/hooks/use-organization";
import { ApiError } from "@/lib/api";
import { DateChipRow } from "@/features/court-booking/components/dark/date-chip-row";
import { CourtChipRow } from "@/features/court-booking/components/dark/court-chip-row";
import { ScoreboardSlotGrid } from "@/features/court-booking/components/dark/scoreboard-slot-grid";
import { BookingSummaryBar } from "@/features/court-booking/components/dark/booking-summary-bar";
import { PerforatedTicket } from "@/features/court-booking/components/dark/perforated-ticket";
import { ClubBookingForm } from "@/features/court-booking/components/admin/club-booking-form";
import { toDateKey } from "@/features/court-booking/lib/date";
import type { CourtSlot, CourtBooking } from "@/types/court";
import type { MemberRole } from "@/types/common";

export default function CourtBookingScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  const { data: bookingEnabled, isLoading: bookingEnabledLoading } =
    useCourtBookingEnabled(organizationId);
  const { data: memberRole } = useActiveMemberRole();
  const isClubAdmin = ["owner", "admin"].includes((memberRole?.role ?? "") as MemberRole);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CourtSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<CourtBooking | null>(null);
  const [clubMode, setClubMode] = useState(false);

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const { data: courts, isLoading: courtsLoading } = useCourts(organizationId);
  const { data: availability, refetch: refetchAvailability } = useCourtAvailability(
    selectedCourtId ?? undefined,
    dateKey,
  );
  const { data: quota } = useWeeklyQuota(organizationId);

  const createBooking = useCreateBooking();
  const bookForClub = useBookForClub();
  const cancelBooking = useCancelBooking();

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const handleSelectCourt = useCallback((courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedSlot(null);
    setClubMode(false);
  }, []);

  const handleBook = useCallback(() => {
    if (!selectedCourtId || !selectedSlot) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createBooking.mutate(
      { courtId: selectedCourtId, date: dateKey, startTime: selectedSlot.startTime },
      {
        onSuccess: (booking) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setConfirmedBooking(booking);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            Alert.alert("Créneau indisponible", "Ce créneau vient d'être pris, choisis-en un autre.");
            refetchAvailability();
            setSelectedSlot(null);
          } else if (error instanceof ApiError && error.status === 403) {
            Alert.alert("Limite atteinte", error.message);
          } else {
            Alert.alert("Erreur", "Impossible de créer la réservation.");
          }
        },
      },
    );
  }, [selectedCourtId, selectedSlot, dateKey, createBooking, refetchAvailability]);

  const handleBookForClub = useCallback(
    ({ start, end, purpose }: { start: Date; end: Date; purpose: string }) => {
      if (!selectedCourtId) return;
      bookForClub.mutate(
        {
          courtId: selectedCourtId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          purpose,
        },
        {
          onSuccess: (booking) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setConfirmedBooking(booking);
            setClubMode(false);
          },
          onError: (error) => {
            if (error instanceof ApiError && error.status === 409) {
              Alert.alert("Créneau indisponible", "Ce créneau chevauche une réservation existante.");
              refetchAvailability();
            } else {
              Alert.alert("Erreur", "Impossible de créer la réservation.");
            }
          },
        },
      );
    },
    [selectedCourtId, bookForClub, refetchAvailability],
  );

  const handleCancel = useCallback(() => {
    if (!confirmedBooking) return;
    Alert.alert("Annuler la réservation ?", "Cette action est irréversible.", [
      { text: "Retour", style: "cancel" },
      {
        text: "Annuler la réservation",
        style: "destructive",
        onPress: () => {
          cancelBooking.mutate(confirmedBooking.id, {
            onSuccess: () => {
              setConfirmedBooking(null);
              setSelectedSlot(null);
            },
            onError: () => {
              Alert.alert("Erreur", "Impossible d'annuler la réservation.");
            },
          });
        },
      },
    ]);
  }, [confirmedBooking, cancelBooking]);

  const handleBackFromTicket = useCallback(() => {
    setConfirmedBooking(null);
    setSelectedSlot(null);
  }, []);

  const selectedCourt = courts?.find((c) => c.id === selectedCourtId);

  if (confirmedBooking) {
    return (
      <>
        <Stack.Screen options={{ title: "Réservation" }} />
        <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
          <PerforatedTicket
            booking={confirmedBooking}
            isCancelling={cancelBooking.isPending}
            onCancel={handleCancel}
            onBack={handleBackFromTicket}
          />
        </ScrollView>
      </>
    );
  }

  const weekdayQuota = quota?.weekday;
  const weekendQuota = quota?.weekend;
  const quotaMessage = buildQuotaMessage(weekdayQuota, weekendQuota);

  return (
    <>
      <Stack.Screen options={{ title: "Réserver un terrain" }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {bookingEnabledLoading ? (
          <ActivityIndicator style={styles.loader} color={courtColors.ball} />
        ) : !bookingEnabled ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Fonctionnalité indisponible</Text>
            <Text style={styles.emptyDescription}>
              La réservation de terrain n'est pas encore activée pour ton club.
            </Text>
          </View>
        ) : (
          <>
            {quotaMessage && (
              <View style={styles.quotaBanner}>
                <Text style={styles.quotaText}>{quotaMessage}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DATE</Text>
              <DateChipRow selectedDate={selectedDate} onSelect={handleSelectDate} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TERRAIN</Text>
              {courtsLoading ? (
                <ActivityIndicator style={styles.loader} color={courtColors.ball} />
              ) : !courts || courts.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyTitle}>Aucun terrain disponible</Text>
                </View>
              ) : (
                <CourtChipRow
                  courts={courts}
                  selectedCourtId={selectedCourtId}
                  onSelect={handleSelectCourt}
                />
              )}
            </View>

            {selectedCourtId && isClubAdmin && (
              <Pressable
                onPress={() => setClubMode((v) => !v)}
                style={styles.clubToggle}
              >
                <Text style={styles.clubToggleText}>
                  {clubMode ? "← Revenir au créneau classique" : "Réserver pour le club →"}
                </Text>
              </Pressable>
            )}

            {selectedCourtId && clubMode && (
              <ClubBookingForm
                date={selectedDate}
                onSubmit={handleBookForClub}
                onCancel={() => setClubMode(false)}
                isLoading={bookForClub.isPending}
              />
            )}

            {selectedCourtId && !clubMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CRÉNEAUX</Text>
                {!availability ? (
                  <ActivityIndicator style={styles.loader} color={courtColors.ball} />
                ) : (
                  <ScoreboardSlotGrid
                    slots={availability.slots}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {selectedSlot && selectedCourt && !clubMode && (
        <BookingSummaryBar
          courtName={selectedCourt.name}
          slot={selectedSlot}
          onBook={handleBook}
          isLoading={createBooking.isPending}
        />
      )}
    </>
  );
}

function buildQuotaMessage(
  weekday: { used: number; limit: number | null } | undefined,
  weekend: { used: number; limit: number | null } | undefined,
): string | null {
  const parts: string[] = [];
  if (weekday?.limit != null) {
    const remaining = Math.max(weekday.limit - weekday.used, 0);
    parts.push(`${remaining} réservation${remaining > 1 ? "s" : ""} en semaine`);
  }
  if (weekend?.limit != null) {
    const remaining = Math.max(weekend.limit - weekend.used, 0);
    parts.push(`${remaining} en week-end`);
  }
  if (parts.length === 0) return null;
  return `Il te reste ${parts.join(" et ")} cette semaine.`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    color: courtColors.mist,
    paddingHorizontal: 20,
  },
  loader: {
    paddingVertical: 24,
  },
  emptyWrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 15,
    color: courtColors.chalk,
  },
  emptyDescription: {
    fontFamily: courtFonts.bodyRegular,
    fontSize: 13.5,
    color: courtColors.mist,
  },
  quotaBanner: {
    marginHorizontal: 20,
    backgroundColor: courtColors.pine,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  quotaText: {
    fontFamily: courtFonts.bodyMedium,
    fontSize: 13,
    color: courtColors.ball,
  },
  clubToggle: {
    marginHorizontal: 20,
    alignSelf: "flex-start",
  },
  clubToggleText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 13,
    color: courtColors.clay,
  },
});
