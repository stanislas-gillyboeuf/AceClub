import { View, Text, Pressable, StyleSheet } from "react-native";
import { CalendarClock, ChevronRight, ListChecks } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";

interface CourtBookingCardProps {
  onPressBook: () => void;
  onPressMyBookings: () => void;
}

export function CourtBookingCard({ onPressBook, onPressMyBookings }: CourtBookingCardProps) {
  const scheme = useColorScheme();

  return (
    <Card onPress={onPressBook}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <CalendarClock size={20} color={colors.accentGreen} strokeWidth={1.5} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            Réserver un terrain
          </Text>
          <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
            Choisis une date, un terrain et un créneau
          </Text>
        </View>
        <ChevronRight size={18} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
      </View>

      <View style={[styles.divider, { backgroundColor: semanticColors.borderColor[scheme] }]} />

      <Pressable onPress={onPressMyBookings} style={styles.row}>
        <ListChecks size={18} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
        <Text style={[styles.secondaryLabel, { color: semanticColors.labelPrimary[scheme] }]}>
          Mes réservations
        </Text>
        <ChevronRight size={16} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${colors.accentGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
  },
  divider: {
    height: 0.5,
    marginVertical: 12,
  },
  secondaryLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});
