import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Check, CalendarDays } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useCourts, useCourtAvailability, useBookCourt } from "@/hooks/use-court";
import { CourtChip } from "@/features/courts/components/court-chip";
import { SlotButton } from "@/features/courts/components/slot-button";

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildNextDays(count: number) {
  const out: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function CourtBookingScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  const dates = useMemo(() => buildNextDays(6), []);
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(dates[0]));
  const [courtId, setCourtId] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [slotEnd, setSlotEnd] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { data: courtsData, isLoading: courtsLoading } = useCourts(organizationId);
  const courts = courtsData?.data ?? [];
  const selectedCourt = courts.find((c) => c.id === courtId) ?? null;

  const { data: availabilityData, isLoading: availabilityLoading } = useCourtAvailability(
    courtId ?? "",
    selectedDate,
  );
  const slots = availabilityData?.data.slots ?? [];

  const bookCourt = useBookCourt();

  const handlePickDate = (date: Date) => {
    setSelectedDate(toIsoDate(date));
    setSlotStart(null);
    setSlotEnd(null);
  };

  const handlePickCourt = (id: string) => {
    setCourtId(id);
    setSlotStart(null);
    setSlotEnd(null);
  };

  const handleConfirm = () => {
    if (!courtId || !slotStart || !slotEnd) return;
    bookCourt.mutate(
      { courtId, startTime: slotStart, endTime: slotEnd },
      {
        onSuccess: () => setConfirmed(true),
        onError: (err: any) => {
          const message =
            err?.status === 409
              ? "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisis-en un autre."
              : "Impossible de réserver ce créneau, réessaie.";
          Alert.alert("Oups", message);
        },
      },
    );
  };

  if (confirmed && selectedCourt && slotStart) {
    const time = new Date(slotStart).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateLabel = new Date(slotStart).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return (
      <View style={[styles.confirmContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <View style={styles.confirmCheck}>
          <Check size={30} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={[styles.confirmTitle, { color: semanticColors.labelPrimary[scheme] }]}>
          Réservation confirmée
        </Text>
        <Text style={[styles.confirmSubtitle, { color: semanticColors.labelSecondary[scheme] }]}>
          {selectedCourt.name} · {dateLabel} à {time}
        </Text>
        <Button label="Terminé" onPress={() => router.back()} style={{ marginTop: 24, width: "100%" }} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: selectedCourt ? selectedCourt.name : "Réserver un court" }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Date picker */}
        <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
          DATE
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {dates.map((d, i) => {
            const iso = toIsoDate(d);
            const active = iso === selectedDate;
            return (
              <Pressable key={iso} onPress={() => handlePickDate(d)} style={styles.dateChipWrapper}>
                <GlassView style={styles.dateChip} tintColor={active ? colors.accentGreen : undefined}>
                  <Text
                    style={[
                      styles.dateDay,
                      { color: active ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
                    ]}
                  >
                    {DAY_LABELS[d.getDay()]}
                  </Text>
                  <Text
                    style={[
                      styles.dateNum,
                      { color: active ? "#FFFFFF" : semanticColors.labelPrimary[scheme] },
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                </GlassView>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Court picker */}
        <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
          COURT
        </Text>
        {courtsLoading ? (
          <Text style={{ color: semanticColors.labelTertiary[scheme] }}>Chargement…</Text>
        ) : courts.length === 0 ? (
          <Text style={{ color: semanticColors.labelTertiary[scheme] }}>
            Ce club n'a pas encore ajouté de courts.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtRow}>
            {courts.map((c) => (
              <View key={c.id} style={styles.courtChipWrapper}>
                <CourtChip court={c} selected={c.id === courtId} onPress={() => handlePickCourt(c.id)} />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Slot picker */}
        {courtId && (
          <>
            <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
              CRÉNEAU DISPONIBLE
            </Text>
            {availabilityLoading ? (
              <Text style={{ color: semanticColors.labelTertiary[scheme] }}>Chargement…</Text>
            ) : (
              <View style={styles.slotGrid}>
                {slots.map((slot) => (
                  <SlotButton
                    key={slot.startTime}
                    slot={slot}
                    selected={slot.startTime === slotStart}
                    onPress={() => {
                      setSlotStart(slot.startTime);
                      setSlotEnd(slot.endTime);
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky confirm bar */}
      <View
        style={[
          styles.stickyBar,
          {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderTopColor: semanticColors.divider[scheme],
          },
        ]}
      >
        {slotStart && selectedCourt ? (
          <View style={styles.summaryRow}>
            <CalendarDays size={16} color={colors.accentGreen} />
            <Text style={[styles.summaryText, { color: semanticColors.labelPrimary[scheme] }]}>
              {selectedCourt.name} ·{" "}
              {new Date(slotStart).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              {selectedCourt.pricePerHour ? ` · ${selectedCourt.pricePerHour}€` : ""}
            </Text>
          </View>
        ) : (
          <Text style={[styles.summaryHint, { color: semanticColors.labelTertiary[scheme] }]}>
            {courtId ? "Choisis un créneau" : "Choisis un court pour commencer"}
          </Text>
        )}
        <Button
          label="Réserver"
          onPress={handleConfirm}
          disabled={!slotStart}
          loading={bookCourt.isPending}
          fullWidth
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
  },
  dateChipWrapper: {
    marginRight: 8,
  },
  dateChip: {
    width: 52,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
  },
  dateDay: {
    fontSize: 11,
    fontWeight: "600",
  },
  dateNum: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  courtRow: {
    flexDirection: "row",
  },
  courtChipWrapper: {
    marginRight: 8,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.horizontal,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryHint: {
    fontSize: 13,
  },
  confirmContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.horizontal,
  },
  confirmCheck: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  confirmSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
