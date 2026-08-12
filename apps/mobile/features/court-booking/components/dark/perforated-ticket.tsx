import { View, Text, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
import { formatFullDate, formatTime } from "@/lib/format";
import Button from "@/components/ui/button";
import type { CourtBooking } from "@/types/court";

interface PerforatedTicketProps {
  booking: CourtBooking;
  isCancelling: boolean;
  onCancel: () => void;
  onBack: () => void;
}

export function PerforatedTicket({ booking, isCancelling, onCancel, onBack }: PerforatedTicketProps) {
  return (
    <View style={styles.container}>
      <View style={styles.ticketWrap}>
        <View style={styles.ticket}>
          <View style={styles.stamp}>
            <Text style={styles.stampText}>CONFIRMÉ</Text>
          </View>

          <Text style={styles.club}>{booking.organizationName}</Text>
          <Text style={styles.court}>{booking.courtName}</Text>

          {booking.bookedAsClub && (
            <View style={styles.clubTag}>
              <Text style={styles.clubTagText}>
                RÉSERVÉ PAR LE CLUB{booking.purpose ? ` · ${booking.purpose.toUpperCase()}` : ""}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.date}>{formatFullDate(booking.startAt)}</Text>
          <Text style={styles.time}>
            {formatTime(booking.startAt)} — {formatTime(booking.endAt)}
          </Text>
        </View>
        <View style={styles.notchLeft} />
        <View style={styles.notchRight} />
      </View>

      <View style={styles.actions}>
        <Button label="Retour" onPress={onBack} variant="secondary" />
        <Button
          label="Annuler la réservation"
          onPress={onCancel}
          variant="destructive"
          loading={isCancelling}
        />
      </View>
    </View>
  );
}

const NOTCH = 18;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 24,
    alignItems: "center",
  },
  ticketWrap: {
    width: "100%",
    position: "relative",
  },
  ticket: {
    backgroundColor: courtColors.ink2,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: courtColors.pineLine,
    padding: 24,
    gap: 4,
    overflow: "hidden",
  },
  notchLeft: {
    position: "absolute",
    top: "50%",
    left: -NOTCH / 2,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: courtColors.ink,
    marginTop: -NOTCH / 2,
  },
  notchRight: {
    position: "absolute",
    top: "50%",
    right: -NOTCH / 2,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: courtColors.ink,
    marginTop: -NOTCH / 2,
  },
  stamp: {
    position: "absolute",
    top: 18,
    right: 18,
    borderWidth: 2,
    borderColor: courtColors.ball,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    transform: [{ rotate: "-10deg" }],
  },
  stampText: {
    fontFamily: courtFonts.display,
    fontSize: 15,
    letterSpacing: 1.5,
    color: courtColors.ball,
  },
  club: {
    fontFamily: courtFonts.bodyMedium,
    fontSize: 13,
    color: courtColors.mist,
    paddingRight: 90,
  },
  court: {
    fontFamily: courtFonts.display,
    fontSize: 34,
    letterSpacing: 0.5,
    color: courtColors.chalk,
    paddingRight: 90,
  },
  clubTag: {
    alignSelf: "flex-start",
    backgroundColor: courtColors.clay,
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  clubTagText: {
    fontFamily: courtFonts.monoSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: courtColors.chalk,
  },
  divider: {
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: courtColors.pineLine,
    marginVertical: 16,
  },
  date: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 15,
    color: courtColors.chalk,
  },
  time: {
    fontFamily: courtFonts.mono,
    fontSize: 15,
    color: courtColors.ball,
    marginTop: 4,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
});
