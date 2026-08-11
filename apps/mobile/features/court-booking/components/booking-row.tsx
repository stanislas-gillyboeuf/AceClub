import { View, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { formatShortDate, formatTime } from "@/lib/format";
import type { CourtBooking } from "@/types/court";

interface BookingRowProps {
  booking: CourtBooking;
}

export function BookingRow({ booking }: BookingRowProps) {
  const scheme = useColorScheme();
  const isCancelled = booking.status === "cancelled";

  return (
    <GlassView style={styles.card}>
      <View style={styles.info}>
        <Text style={[styles.court, { color: semanticColors.labelPrimary[scheme] }]}>
          {booking.courtName} · {booking.organizationName}
        </Text>
        <Text style={[styles.date, { color: semanticColors.labelSecondary[scheme] }]}>
          {formatShortDate(booking.startAt)} · {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
        </Text>
      </View>
      {isCancelled && (
        <View style={[styles.badge, { backgroundColor: colors.red50 }]}>
          <Text style={[styles.badgeText, { color: colors.red500 }]}>Annulée</Text>
        </View>
      )}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    padding: 14,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  court: {
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    fontSize: 13,
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
