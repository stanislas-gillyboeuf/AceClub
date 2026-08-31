import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "@/features/court-booking/theme";
import { PerforatedTicket } from "@/features/court-booking/components/perforated-ticket";
import { PartnerSearchExpand } from "@/features/court-booking/components/partner-search-expand";
import { ConfettiBurst } from "@/features/court-booking/components/confetti-burst";
import { useTabBarClearance } from "@/features/court-booking/lib/layout";
import { useCourtBookingDetail, useCancelBooking, useJoinBooking, useFrequentPartners } from "@/hooks/use-court";

export default function TicketScreen() {
  const scheme = useColorScheme();
  const tabBarClearance = useTabBarClearance();
  const { bookingId, justBooked } = useLocalSearchParams<{ bookingId: string; justBooked?: string }>();
  const { data: booking, isLoading } = useCourtBookingDetail(bookingId);
  const cancelBooking = useCancelBooking();
  const joinBooking = useJoinBooking();
  const { data: frequentPartners } = useFrequentPartners();
  const [addingSlot, setAddingSlot] = useState(false);

  const handleCancel = () => {
    if (!booking) return;
    Alert.alert("Annuler la réservation ?", "Cette action est irréversible.", [
      { text: "Retour", style: "cancel" },
      {
        text: "Annuler la réservation",
        style: "destructive",
        onPress: () => {
          cancelBooking.mutate(booking.id, {
            onSuccess: () => router.back(),
            onError: () => Alert.alert("Erreur", "Impossible d'annuler la réservation."),
          });
        },
      },
    ]);
  };

  if (isLoading || !booking) {
    return (
      <View style={[styles.loading, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <ActivityIndicator color={bookingGreen.bright} />
      </View>
    );
  }

  const isPast = new Date(booking.startAt).getTime() < Date.now();
  const filledCount = 1 + booking.participants.filter((p) => p.name).length;
  const isPadel = booking.sport === "padel";
  const usedIds = new Set(booking.participants.map((p) => p.userId).filter(Boolean));
  const suggestions = (frequentPartners ?? []).filter((p) => !usedIds.has(p.userId));

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      contentContainerStyle={[styles.content, { paddingBottom: 20 + tabBarClearance }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, { color: semanticColors.labelSecondary[scheme] }]}>← Retour</Text>
      </Pressable>

      <View style={styles.ticketWrap}>
        <PerforatedTicket booking={booking} />
        {justBooked === "1" && !isPast && <ConfettiBurst />}
      </View>

      <View style={styles.actions}>
        {isPadel && !isPast && filledCount < 4 && (
          <Pressable
            onPress={() => setAddingSlot((v) => !v)}
            style={[styles.secondaryButton, { backgroundColor: semanticColors.systemGray6[scheme], borderColor: semanticColors.borderColor[scheme] }]}
          >
            <Text style={[styles.secondaryButtonText, { color: semanticColors.labelPrimary[scheme] }]}>
              Compléter l&apos;équipe
            </Text>
          </Pressable>
        )}
        {addingSlot && (
          <PartnerSearchExpand
            organizationId={booking.organizationId}
            suggestions={suggestions}
            onSelect={(selection) => {
              joinBooking.mutate(
                { bookingId: booking.id, userId: selection.userId, guestName: selection.guestName },
                { onSuccess: () => setAddingSlot(false) },
              );
            }}
          />
        )}
        <Pressable onPress={() => router.back()} style={[styles.primaryButton, { backgroundColor: bookingGreen.bright }]}>
          <Text style={styles.primaryButtonText}>Terminé</Text>
        </Pressable>
        {!isPast && (
          <Pressable
            onPress={handleCancel}
            disabled={cancelBooking.isPending}
            style={[styles.ghostButton, { borderColor: `${colors.red500}66` }]}
          >
            <Text style={[styles.ghostButtonText, { color: colors.red500 }]}>Annuler la réservation</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    paddingVertical: 8,
    paddingBottom: 18,
  },
  backText: {
    fontWeight: "600",
    fontSize: 12,
  },
  ticketWrap: {
    position: "relative",
  },
  actions: {
    marginTop: 22,
    gap: 10,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 11,
    alignItems: "center",
  },
  primaryButtonText: {
    color: bookingGreen.onBright,
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "700",
    fontSize: 13.5,
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
  },
  ghostButtonText: {
    fontWeight: "700",
    fontSize: 13,
  },
});
