import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { courtColors } from "@/features/court-booking/theme";
import { ClubBookingForm } from "@/features/court-booking/components/admin/club-booking-form";
import { useTabBarClearance } from "@/features/court-booking/lib/layout";
import { useMyOrganizations } from "@/hooks/use-organization";
import { useCourts, useBookForClub } from "@/hooks/use-court";

export default function BookForClubScreen() {
  const insets = useSafeAreaInsets();
  const tabBarClearance = useTabBarClearance();
  const { data: orgs } = useMyOrganizations();
  const primaryOrg = orgs?.[0] ?? null;
  const { data: courts, isLoading } = useCourts(primaryOrg?.id);
  const bookForClub = useBookForClub();

  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const selectedCourt = courts?.find((c) => c.id === selectedCourtId);

  const handleSubmit = ({ start, end, purpose }: { start: Date; end: Date; purpose: string }) => {
    if (!selectedCourtId) return;
    bookForClub.mutate(
      { courtId: selectedCourtId, startAt: start.toISOString(), endAt: end.toISOString(), purpose },
      {
        onSuccess: (booking) => router.replace(`/(tabs)/booking/ticket/${booking.id}`),
        onError: () => Alert.alert("Erreur", "Impossible de créer la réservation."),
      },
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 20 + tabBarClearance }]}>
        <Text style={styles.title}>Réserver pour le club</Text>
        <Text style={styles.subtitle}>Cours, tournois, événements — choisis d&apos;abord un terrain.</Text>

        {isLoading ? (
          <ActivityIndicator color={courtColors.chartreuse} style={styles.loader} />
        ) : (
          <View style={styles.courtRow}>
            {(courts ?? []).map((court) => {
              const active = court.id === selectedCourtId;
              return (
                <Pressable
                  key={court.id}
                  onPress={() => setSelectedCourtId(court.id)}
                  style={[styles.courtChip, active && styles.courtChipActive]}
                >
                  <Text style={[styles.courtChipText, active && styles.courtChipTextActive]}>{court.name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {selectedCourt && (
          <ClubBookingForm
            date={new Date()}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedCourtId(null)}
            isLoading={bookForClub.isPending}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink900,
  },
  backButton: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  backText: {
    color: courtColors.chalkDim,
    fontWeight: "600",
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 16,
  },
  title: {
    fontWeight: "800",
    fontSize: 22,
    color: courtColors.chalk,
  },
  subtitle: {
    fontSize: 12.5,
    color: courtColors.chalkDim,
  },
  loader: {
    paddingVertical: 24,
  },
  courtRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  courtChip: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: courtColors.line,
    backgroundColor: courtColors.ink700,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  courtChipActive: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  courtChipText: {
    fontWeight: "700",
    fontSize: 12.5,
    color: courtColors.chalkDim,
  },
  courtChipTextActive: {
    color: courtColors.ink900,
  },
});
