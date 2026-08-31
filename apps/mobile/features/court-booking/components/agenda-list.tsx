import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
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
  const scheme = useColorScheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: semanticColors.labelSecondary[scheme] }]}>{title}</Text>
      {bookings.length === 0 ? (
        <Text style={[styles.empty, { color: semanticColors.labelSecondary[scheme] }]}>{emptyLabel}</Text>
      ) : (
        bookings.map((booking) => (
          <AgendaItem key={booking.id} booking={booking} scheme={scheme} onPress={() => onPress(booking)} />
        ))
      )}
    </View>
  );
}

function AgendaItem({ booking, scheme, onPress }: { booking: CourtBooking; scheme: ColorScheme; onPress: () => void }) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const isPast = start.getTime() < Date.now();
  const isPadel = booking.sport === "padel";
  const filledCount = 1 + booking.participantCount;
  const incomplete = !isPast && isPadel && filledCount < 4;
  const deadlineHour = Math.max(start.getHours() - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0);

  const leftAccent = isPast ? semanticColors.labelTertiary[scheme] : incomplete ? colors.accentOrange : colors.accentGreen;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
          borderLeftColor: leftAccent,
        },
        isPast && { opacity: 0.7 },
      ]}
    >
      <View style={styles.dayBlock}>
        <Text style={[styles.dayNumber, { color: isPast ? semanticColors.labelSecondary[scheme] : colors.accentGreen }]}>
          {start.getDate()}
        </Text>
        <Text style={[styles.dayMonth, { color: semanticColors.labelTertiary[scheme] }]}>
          {capitalize(monthAbbrevFormatter.format(start)).replace(".", "")}
        </Text>
      </View>
      <View style={styles.main}>
        <Text style={[styles.court, { color: semanticColors.labelPrimary[scheme] }]}>
          {booking.courtName} · {start.getHours()}h–{end.getHours()}h
        </Text>
        <Text style={[styles.sub, { color: semanticColors.labelSecondary[scheme] }]}>
          {isPadel ? "Padel" : "Tennis"} ·{" "}
          {booking.participantCount > 0
            ? `avec ${booking.participantCount} partenaire${booking.participantCount > 1 ? "s" : ""}`
            : "seul pour l'instant"}
        </Text>
        {incomplete && (
          <Text style={[styles.badge, { color: colors.accentOrange }]}>
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
    marginBottom: 10,
  },
  empty: {
    fontSize: 13,
    paddingVertical: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  dayBlock: {
    minWidth: 48,
    alignItems: "center",
  },
  dayNumber: {
    fontWeight: "800",
    fontSize: 19,
    lineHeight: 22,
    fontVariant: ["tabular-nums"],
  },
  dayMonth: {
    fontSize: 8.5,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  court: {
    fontWeight: "800",
    fontSize: 14,
  },
  sub: {
    fontSize: 10.5,
  },
  badge: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 3,
  },
});
