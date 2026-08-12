import { View, Text, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
import { formatShortDate, formatTime } from "@/lib/format";
import type { CourtBooking } from "@/types/court";

interface BookingRowProps {
  booking: CourtBooking;
}

export function BookingRow({ booking }: BookingRowProps) {
  const isCancelled = booking.status === "cancelled";

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.court} numberOfLines={1}>
            {booking.courtName} · {booking.organizationName}
          </Text>
          {booking.bookedAsClub && (
            <View style={styles.clubBadge}>
              <Text style={styles.clubBadgeText}>CLUB</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>
          {formatShortDate(booking.startAt)} · {formatTime(booking.startAt)} -{" "}
          {formatTime(booking.endAt)}
        </Text>
        {booking.purpose && <Text style={styles.purpose}>{booking.purpose}</Text>}
      </View>
      {isCancelled && (
        <View style={styles.cancelledBadge}>
          <Text style={styles.cancelledText}>Annulée</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: courtColors.ink2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: courtColors.pineLine,
    padding: 14,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  court: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 15,
    color: courtColors.chalk,
    flexShrink: 1,
  },
  date: {
    fontFamily: courtFonts.mono,
    fontSize: 12.5,
    color: courtColors.mist,
  },
  purpose: {
    fontFamily: courtFonts.bodyMedium,
    fontSize: 12.5,
    color: courtColors.ball,
    marginTop: 1,
  },
  clubBadge: {
    backgroundColor: courtColors.clay,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clubBadgeText: {
    fontFamily: courtFonts.monoSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: courtColors.chalk,
  },
  cancelledBadge: {
    backgroundColor: "rgba(187, 83, 51, 0.16)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelledText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 12,
    color: courtColors.clay,
  },
});
