import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { formatFullDate, formatTime } from "@/lib/format";
import Button from "@/components/ui/button";
import type { CourtBooking } from "@/types/court";

interface BookingTicketProps {
  booking: CourtBooking;
  isCancelling: boolean;
  onCancel: () => void;
  onBack: () => void;
}

export function BookingTicket({ booking, isCancelling, onCancel, onBack }: BookingTicketProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <GlassView style={styles.iconWrap} tintColor={colors.accentGreen}>
        <Check size={28} color="#FFFFFF" strokeWidth={2.5} />
      </GlassView>

      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        Réservation confirmée
      </Text>

      <View
        style={[
          styles.ticket,
          {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        <Text style={[styles.club, { color: semanticColors.labelSecondary[scheme] }]}>
          {booking.organizationName}
        </Text>
        <Text style={[styles.court, { color: semanticColors.labelPrimary[scheme] }]}>
          {booking.courtName}
        </Text>
        <View style={styles.divider} />
        <Text style={[styles.date, { color: semanticColors.labelPrimary[scheme] }]}>
          {formatFullDate(booking.startAt)}
        </Text>
        <Text style={[styles.time, { color: semanticColors.labelSecondary[scheme] }]}>
          {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
        </Text>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 24,
    gap: 20,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  ticket: {
    width: "100%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 20,
    gap: 4,
  },
  club: {
    fontSize: 13,
    fontWeight: "500",
  },
  court: {
    fontSize: 20,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128,128,128,0.2)",
    marginVertical: 12,
  },
  date: {
    fontSize: 15,
    fontWeight: "600",
  },
  time: {
    fontSize: 15,
    marginTop: 2,
  },
  actions: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
});
