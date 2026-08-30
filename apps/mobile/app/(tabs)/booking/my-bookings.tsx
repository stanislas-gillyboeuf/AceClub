import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BookingCalendar } from "@/features/court-booking/components/booking-calendar";
import { AgendaList } from "@/features/court-booking/components/agenda-list";
import { useTabBarClearance } from "@/features/court-booking/lib/layout";
import { useMyBookings } from "@/hooks/use-court";
import type { CourtBooking } from "@/types/court";

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

const EMPTY_BOOKINGS: CourtBooking[] = [];

export default function MyBookingsScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarClearance = useTabBarClearance();
  const { data: bookings, isLoading } = useMyBookings("all");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const list = bookings ?? EMPTY_BOOKINGS;

  const { upcoming, past, selected } = useMemo(() => {
    const now = new Date();
    const sorted = [...list].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    if (selectedDate) {
      return {
        upcoming: [] as CourtBooking[],
        past: [] as CourtBooking[],
        selected: sorted.filter((b) => sameDay(new Date(b.startAt), selectedDate)),
      };
    }
    return {
      upcoming: sorted.filter((b) => new Date(b.startAt) >= now),
      past: sorted.filter((b) => new Date(b.startAt) < now).reverse(),
      selected: [] as CourtBooking[],
    };
  }, [list, selectedDate]);

  const openTicket = (booking: CourtBooking) => router.push(`/(tabs)/booking/ticket/${booking.id}`);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 12, backgroundColor: semanticColors.primaryBackground[scheme] }]}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, { color: semanticColors.labelSecondary[scheme] }]}>← Retour</Text>
      </Pressable>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 20 + tabBarClearance }]}>
        <Text style={[styles.eyebrow, { color: colors.accentGreen }]}>AceClub</Text>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>Mes réservations</Text>
        <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
          Tes créneaux, passés et à venir
        </Text>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.accentGreen} />
        ) : (
          <>
            <BookingCalendar
              month={month}
              bookings={list}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              onNextMonth={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            />

            {selectedDate ? (
              <AgendaList
                title="Ce jour-là"
                bookings={selected}
                emptyLabel="Aucune réservation ce jour-là."
                onPress={openTicket}
              />
            ) : (
              <>
                <AgendaList title="À venir" bookings={upcoming} emptyLabel="Rien de prévu." onPress={openTicket} />
                <AgendaList
                  title="Passées"
                  bookings={past}
                  emptyLabel="Pas encore d'historique."
                  onPress={openTicket}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  backText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 60,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    fontWeight: "800",
    fontSize: 26,
    marginTop: 2,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  loader: {
    paddingVertical: 40,
  },
});
