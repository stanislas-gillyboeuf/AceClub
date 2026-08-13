import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, type GestureResponderEvent } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronsLeftRight } from "lucide-react-native";
import { courtColors, courtFontMono } from "@/features/court-booking/theme";
import { SportToggle } from "@/features/court-booking/components/sport-toggle";
import { CourtTypeChipRow } from "@/features/court-booking/components/court-type-chip-row";
import { DayChipRow } from "@/features/court-booking/components/day-chip-row";
import { BookingBoard } from "@/features/court-booking/components/booking-board";
import { WhoBookedPopover, type PopoverState } from "@/features/court-booking/components/who-booked-popover";
import { buildCourtTypeFilters } from "@/features/court-booking/lib/court-filters";
import { toDateKey, formatFullDay } from "@/features/court-booking/lib/date";
import { useMyOrganizations, useActiveMemberRole } from "@/hooks/use-organization";
import { useCourtBookingEnabled, useCourtBoard } from "@/hooks/use-court";
import type { BoardCourt, BoardHourCell, CourtSport } from "@/types/court";
import type { MemberRole } from "@/types/common";

export default function BookingBoardScreen() {
  const insets = useSafeAreaInsets();
  const { data: orgs } = useMyOrganizations();
  const primaryOrg = orgs?.[0] ?? null;
  const { data: memberRole } = useActiveMemberRole();
  const isClubAdmin = ["owner", "admin"].includes((memberRole?.role ?? "") as MemberRole);

  const { data: bookingEnabled, isLoading: bookingEnabledLoading } = useCourtBookingEnabled(primaryOrg?.id);

  const [sport, setSport] = useState<CourtSport>("tennis");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [courtTypeKey, setCourtTypeKey] = useState("any");
  const [fullMode, setFullMode] = useState(false);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const dateKey = toDateKey(selectedDate);
  const dayIndex = Math.round((selectedDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const dateLabel = formatFullDay(selectedDate, dayIndex);

  const { data: board, isLoading: boardLoading } = useCourtBoard(primaryOrg?.id, sport, dateKey);

  const filters = useMemo(() => buildCourtTypeFilters(sport, board?.courts ?? []), [sport, board]);
  const activeFilter = filters.find((f) => f.key === courtTypeKey) ?? filters[0];
  const filteredCourts = useMemo(
    () => (board?.courts ?? []).filter((c) => activeFilter.matches(c)),
    [board, activeFilter],
  );

  const handleSelectSport = (next: CourtSport) => {
    setSport(next);
    setCourtTypeKey("any");
  };

  const handleSelectFree = (court: BoardCourt, hour: number) => {
    router.push({
      pathname: "/(tabs)/booking/confirm",
      params: {
        organizationId: primaryOrg?.id ?? "",
        courtId: court.id,
        courtName: court.name,
        courtTag: courtTag(court),
        sport,
        date: dateKey,
        dateLabel,
        hour: String(hour),
        cancellationPolicy: court.cancellationPolicy,
        cancellationWindowHours: court.cancellationWindowHours != null ? String(court.cancellationWindowHours) : "",
      },
    });
  };

  const handleSelectBooked = (court: BoardCourt, cell: BoardHourCell, event: GestureResponderEvent) => {
    setPopover({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
      label: cell.bookedAsClub ? "Réservé par le club" : `Réservé par ${cell.bookedByLabel}`,
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <View style={styles.topRowLeft}>
          {router.canGoBack() && (
            <Pressable onPress={() => router.back()} style={styles.backArrow}>
              <Text style={styles.backArrowText}>←</Text>
            </Pressable>
          )}
          <View>
            <Text style={styles.eyebrow}>AceClub{primaryOrg ? ` · ${primaryOrg.name}` : ""}</Text>
            <Text style={styles.title}>Réserver</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/booking/my-bookings")}>
          <Text style={styles.linkButton}>Mes réservations</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {bookingEnabledLoading ? (
          <ActivityIndicator style={styles.loader} color={courtColors.chartreuse} />
        ) : !bookingEnabled ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Fonctionnalité indisponible</Text>
            <Text style={styles.emptyDescription}>
              La réservation de terrain n&apos;est pas encore activée pour ton club.
            </Text>
          </View>
        ) : (
          <>
            <SportToggle sport={sport} onChange={handleSelectSport} />

            <Text style={styles.sectionLabel}>Court</Text>
            <CourtTypeChipRow filters={filters} selectedKey={activeFilter.key} onSelect={setCourtTypeKey} />

            <Text style={styles.sectionLabel}>
              Jour <Text style={styles.sectionLabelDim}>— réservable jusqu&apos;à J+6</Text>
            </Text>
            <DayChipRow selectedDate={selectedDate} onSelect={setSelectedDate} />

            <View style={styles.headerActions}>
              {!fullMode && (
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotFree]} />
                    <Text style={styles.legendText}>Libre</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotBooked]} />
                    <Text style={styles.legendText}>Réservé</Text>
                  </View>
                </View>
              )}
              <Pressable onPress={() => setFullMode((v) => !v)} style={[styles.toggleBtn, fullMode && styles.toggleBtnOn]}>
                <Text style={[styles.toggleBtnText, fullMode && styles.toggleBtnTextOn]}>
                  {fullMode ? "Vue simple" : "Tout voir"}
                </Text>
              </Pressable>
            </View>

            {boardLoading ? (
              <ActivityIndicator style={styles.loader} color={courtColors.chartreuse} />
            ) : filteredCourts.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Aucun terrain disponible</Text>
              </View>
            ) : (
              <>
                <BookingBoard
                  courts={filteredCourts}
                  fullMode={fullMode}
                  onSelectFree={handleSelectFree}
                  onSelectBooked={handleSelectBooked}
                />
                <View style={styles.scrollHint}>
                  <ChevronsLeftRight size={13} color={courtColors.chalkFaint} strokeWidth={2} />
                  <Text style={styles.scrollHintText}>glisser pour voir les heures suivantes</Text>
                </View>
              </>
            )}

            {isClubAdmin && (
              <View style={styles.adminLinks}>
                <Pressable onPress={() => router.push("/court-booking/booking-rules")}>
                  <Text style={styles.adminLinkText}>Gérer les règles →</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/(tabs)/booking/book-for-club")}>
                  <Text style={styles.adminLinkText}>Réserver pour le club →</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <WhoBookedPopover popover={popover} onDismiss={() => setPopover(null)} />
    </View>
  );
}

function courtTag(court: BoardCourt): string {
  return [court.surface, court.indoor ? "couvert" : null].filter(Boolean).join(" · ");
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink900,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  topRowLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backArrow: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: courtColors.line,
    backgroundColor: courtColors.ink700,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrowText: {
    color: courtColors.chalk,
    fontSize: 16,
  },
  eyebrow: {
    fontFamily: courtFontMono,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: courtColors.chartreuseDim,
  },
  title: {
    fontWeight: "800",
    fontSize: 26,
    color: courtColors.chalk,
    marginTop: 2,
  },
  linkButton: {
    fontFamily: courtFontMono,
    fontSize: 11,
    color: courtColors.chalkDim,
    textDecorationLine: "underline",
    paddingTop: 8,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 48,
    gap: 14,
  },
  sectionLabel: {
    fontFamily: courtFontMono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: courtColors.chalkDim,
    paddingHorizontal: 20,
  },
  sectionLabelDim: {
    opacity: 0.6,
    textTransform: "none",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  legend: {
    flexDirection: "row",
    gap: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontFamily: courtFontMono,
    fontSize: 11,
    color: courtColors.chalkDim,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  dotFree: {
    backgroundColor: courtColors.chartreuse,
  },
  dotBooked: {
    backgroundColor: courtColors.rustDim,
    borderWidth: 1,
    borderColor: courtColors.rust,
  },
  toggleBtn: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toggleBtnOn: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  toggleBtnText: {
    fontFamily: courtFontMono,
    fontSize: 10.5,
    color: courtColors.chalkDim,
  },
  toggleBtnTextOn: {
    color: courtColors.ink900,
    fontWeight: "600",
  },
  scrollHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  scrollHintText: {
    fontFamily: courtFontMono,
    fontSize: 10.5,
    color: courtColors.chalkFaint,
  },
  loader: {
    paddingVertical: 24,
  },
  emptyWrap: {
    paddingHorizontal: 20,
    gap: 4,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: courtColors.chalk,
  },
  emptyDescription: {
    fontSize: 13.5,
    color: courtColors.chalkDim,
  },
  adminLinks: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  adminLinkText: {
    fontWeight: "600",
    fontSize: 13,
    color: courtColors.rust,
  },
});
