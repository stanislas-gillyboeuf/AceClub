import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMyOrganizations } from "@/hooks/use-organization";
import { useCourts, useCourtAvailability, useCreateBooking, useCancelBooking } from "@/hooks/use-court";
import { ApiError } from "@/lib/api";
import { semanticColors, spacing } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import { DateChipRow } from "@/features/court-booking/components/date-chip-row";
import { CourtChipRow } from "@/features/court-booking/components/court-chip-row";
import { SlotGrid } from "@/features/court-booking/components/slot-grid";
import { BookingSummaryBar } from "@/features/court-booking/components/booking-summary-bar";
import { BookingTicket } from "@/features/court-booking/components/booking-ticket";
import { toDateKey } from "@/features/court-booking/lib/date";
import type { CourtSlot, CourtBooking } from "@/types/court";

export default function CourtBookingScreen() {
  const scheme = useColorScheme();

  const { data: organizations, isLoading: orgsLoading } = useMyOrganizations();
  const organizationId = organizations?.[0]?.id;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CourtSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<CourtBooking | null>(null);

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const { data: courts, isLoading: courtsLoading } = useCourts(organizationId);
  const { data: availability, refetch: refetchAvailability } = useCourtAvailability(
    selectedCourtId ?? undefined,
    dateKey,
  );

  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const handleSelectCourt = useCallback((courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedSlot(null);
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
            Alert.alert(
              "Créneau indisponible",
              "Ce créneau vient d'être pris, choisis-en un autre.",
            );
            refetchAvailability();
            setSelectedSlot(null);
          } else {
            Alert.alert("Erreur", "Impossible de créer la réservation.");
          }
        },
      },
    );
  }, [selectedCourtId, selectedSlot, dateKey, createBooking, refetchAvailability]);

  const handleCancel = useCallback(() => {
    if (!confirmedBooking) return;
    Alert.alert(
      "Annuler la réservation ?",
      "Cette action est irréversible.",
      [
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
      ],
    );
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
        <ScrollView
          style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
          contentInsetAdjustmentBehavior="automatic"
        >
          <BookingTicket
            booking={confirmedBooking}
            isCancelling={cancelBooking.isPending}
            onCancel={handleCancel}
            onBack={handleBackFromTicket}
          />
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Réserver un terrain" }} />
      <ScrollView
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {orgsLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : !organizationId ? (
          <EmptyState
            icon="Building2"
            title="Rejoins un club pour réserver un terrain"
            description="Tu dois faire partie d'un club pour accéder à ses terrains."
          />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelSecondary[scheme] }]}>
                DATE
              </Text>
              <DateChipRow selectedDate={selectedDate} onSelect={handleSelectDate} />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelSecondary[scheme] }]}>
                TERRAIN
              </Text>
              {courtsLoading ? (
                <ActivityIndicator style={styles.loader} />
              ) : !courts || courts.length === 0 ? (
                <View style={styles.emptyCourts}>
                  <EmptyState icon="MapPinOff" title="Aucun terrain disponible pour ce club" />
                </View>
              ) : (
                <CourtChipRow
                  courts={courts}
                  selectedCourtId={selectedCourtId}
                  onSelect={handleSelectCourt}
                />
              )}
            </View>

            {selectedCourtId && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: semanticColors.labelSecondary[scheme] }]}>
                  CRÉNEAUX
                </Text>
                {!availability ? (
                  <ActivityIndicator style={styles.loader} />
                ) : (
                  <SlotGrid
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

      {selectedSlot && selectedCourt && (
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

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: spacing.horizontal,
  },
  loader: {
    paddingVertical: 24,
  },
  emptyCourts: {
    paddingHorizontal: spacing.horizontal,
  },
});
