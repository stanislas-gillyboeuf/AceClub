import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { courtColors } from "@/features/court-booking/theme";
import { PerforatedTicket } from "@/features/court-booking/components/perforated-ticket";
import { PartnerSearchExpand } from "@/features/court-booking/components/partner-search-expand";
import { ConfettiBurst } from "@/features/court-booking/components/confetti-burst";
import { useTabBarClearance } from "@/features/court-booking/lib/layout";
import { useCourtBookingDetail, useCancelBooking, useJoinBooking, useFrequentPartners } from "@/hooks/use-court";

export default function TicketScreen() {
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
      <View style={styles.loading}>
        <ActivityIndicator color={courtColors.chartreuse} />
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
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: 20 + tabBarClearance }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <View style={styles.ticketWrap}>
        <PerforatedTicket booking={booking} />
        {justBooked === "1" && !isPast && <ConfettiBurst />}
      </View>

      <View style={styles.actions}>
        {isPadel && !isPast && filledCount < 4 && (
          <Pressable onPress={() => setAddingSlot((v) => !v)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Compléter l&apos;équipe</Text>
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
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Terminé</Text>
        </Pressable>
        {!isPast && (
          <Pressable onPress={handleCancel} disabled={cancelBooking.isPending} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Annuler la réservation</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink900,
  },
  loading: {
    flex: 1,
    backgroundColor: courtColors.ink900,
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
    color: courtColors.chalkDim,
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
    backgroundColor: courtColors.chartreuse,
    paddingVertical: 14,
    borderRadius: 11,
    alignItems: "center",
  },
  primaryButtonText: {
    color: courtColors.ink900,
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: courtColors.chalk,
    fontWeight: "700",
    fontSize: 13.5,
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: courtColors.rustDim,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
  },
  ghostButtonText: {
    color: courtColors.rust,
    fontWeight: "700",
    fontSize: 13,
  },
});
