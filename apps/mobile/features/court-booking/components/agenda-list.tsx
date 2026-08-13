import { View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors, courtFontMono } from "../theme";
import { PADEL_TEAM_COMPLETION_WINDOW_HOURS } from "../lib/constants";
import type { CourtBooking } from "@/types/court";

const monthAbbrevFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });

interface AgendaListProps {
  title: string;
  bookings: CourtBooking[];
  emptyLabel: string;
  onPress: (booking: CourtBooking) => void;
}

export function AgendaList({ title, bookings, emptyLabel, onPress }: AgendaListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        bookings.map((booking) => <AgendaItem key={booking.id} booking={booking} onPress={() => onPress(booking)} />)
      )}
    </View>
  );
}

function AgendaItem({ booking, onPress }: { booking: CourtBooking; onPress: () => void }) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const isPast = start.getTime() < Date.now();
  const isPadel = booking.sport === "padel";
  const filledCount = 1 + booking.participantCount;
  const incomplete = !isPast && isPadel && filledCount < 4;
  const deadlineHour = Math.max(start.getHours() - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, isPast && styles.itemPast, incomplete && styles.itemIncomplete]}
    >
      <View style={styles.dayBlock}>
        <Text style={[styles.dayNumber, isPast && styles.dayNumberPast]}>{start.getDate()}</Text>
        <Text style={styles.dayMonth}>{capitalize(monthAbbrevFormatter.format(start)).replace(".", "")}</Text>
      </View>
      <View style={styles.main}>
        <Text style={styles.court}>
          {booking.courtName} · {start.getHours()}h–{end.getHours()}h
        </Text>
        <Text style={styles.sub}>
          {isPadel ? "Padel" : "Tennis"} ·{" "}
          {booking.participantCount > 0
            ? `avec ${booking.participantCount} partenaire${booking.participantCount > 1 ? "s" : ""}`
            : "seul pour l'instant"}
        </Text>
        {incomplete && (
          <Text style={styles.badge}>
            ⏱ {filledCount}/4 · à compléter avant {deadlineHour}h
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  heading: {
    fontWeight: "800",
    fontSize: 15,
    color: courtColors.chalkDim,
    marginBottom: 10,
  },
  empty: {
    color: courtColors.chalkDim,
    fontSize: 13,
    paddingVertical: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: courtColors.ink800,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderLeftWidth: 3,
    borderLeftColor: courtColors.chartreuse,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  itemPast: {
    borderLeftColor: courtColors.chalkFaint,
    opacity: 0.7,
  },
  itemIncomplete: {
    borderLeftColor: courtColors.amber,
  },
  dayBlock: {
    minWidth: 48,
    alignItems: "center",
  },
  dayNumber: {
    fontWeight: "800",
    fontSize: 19,
    color: courtColors.chartreuse,
    lineHeight: 22,
  },
  dayNumberPast: {
    color: courtColors.chalkDim,
  },
  dayMonth: {
    fontFamily: courtFontMono,
    fontSize: 8.5,
    textTransform: "uppercase",
    color: courtColors.chalkFaint,
    marginTop: 2,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  court: {
    fontWeight: "800",
    fontSize: 14,
    color: courtColors.chalk,
  },
  sub: {
    fontFamily: courtFontMono,
    fontSize: 10.5,
    color: courtColors.chalkDim,
  },
  badge: {
    fontFamily: courtFontMono,
    fontSize: 9,
    color: courtColors.amber,
    marginTop: 3,
  },
});
