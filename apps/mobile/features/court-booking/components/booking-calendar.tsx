import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { CourtBooking } from "@/types/court";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

interface BookingCalendarProps {
  month: Date;
  bookings: CourtBooking[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function BookingCalendar({
  month,
  bookings,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: BookingCalendarProps) {
  const scheme = useColorScheme();
  const now = new Date();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  return (
    <View>
      <View style={styles.nav}>
        <Pressable
          onPress={onPrevMonth}
          style={[styles.navButton, { borderColor: semanticColors.borderColor[scheme], backgroundColor: semanticColors.systemGray6[scheme] }]}
        >
          <Text style={[styles.navButtonText, { color: semanticColors.labelPrimary[scheme] }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: semanticColors.labelPrimary[scheme] }]}>
          {capitalize(monthFormatter.format(month))}
        </Text>
        <Pressable
          onPress={onNextMonth}
          style={[styles.navButton, { borderColor: semanticColors.borderColor[scheme], backgroundColor: semanticColors.systemGray6[scheme] }]}
        >
          <Text style={[styles.navButtonText, { color: semanticColors.labelPrimary[scheme] }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={[styles.weekday, { color: semanticColors.labelTertiary[scheme] }]}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.dayEmpty} />;

          const dayBookings = bookings.filter((b) => sameDay(new Date(b.startAt), date));
          const isToday = sameDay(date, now);
          const isPast = date < now && !isToday;
          const isSelected = !!selectedDate && sameDay(date, selectedDate);
          const hasBooking = dayBookings.length > 0;

          return (
            <Pressable
              key={date.toISOString()}
              disabled={!hasBooking}
              onPress={() => onSelectDate(isSelected ? null : date)}
              style={[
                styles.day,
                hasBooking && { backgroundColor: semanticColors.systemGray6[scheme] },
                isToday && { borderWidth: 1.5, borderColor: semanticColors.labelSecondary[scheme] },
                isSelected && { backgroundColor: colors.accentGreen },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: isSelected ? colors.white : semanticColors.labelSecondary[scheme] },
                  isSelected && { fontWeight: "700" },
                ]}
              >
                {date.getDate()}
              </Text>
              {hasBooking && (
                <View
                  style={[
                    styles.calDot,
                    {
                      backgroundColor: isSelected
                        ? colors.white
                        : isPast
                          ? semanticColors.labelTertiary[scheme]
                          : colors.accentGreen,
                    },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.calDot, { backgroundColor: colors.accentGreen }]} />
          <Text style={[styles.legendText, { color: semanticColors.labelSecondary[scheme] }]}>À venir</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.calDot, { backgroundColor: semanticColors.labelTertiary[scheme] }]} />
          <Text style={[styles.legendText, { color: semanticColors.labelSecondary[scheme] }]}>Passée</Text>
        </View>
      </View>
    </View>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const CELL = "14.28%" as const;

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 16,
  },
  monthLabel: {
    fontWeight: "800",
    fontSize: 17,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  weekday: {
    width: CELL,
    textAlign: "center",
    fontSize: 9.5,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingBottom: 6,
  },
  dayEmpty: {
    width: CELL,
    aspectRatio: 1,
  },
  day: {
    width: CELL,
    aspectRatio: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dayNumber: {
    fontSize: 12.5,
    fontVariant: ["tabular-nums"],
  },
  calDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 11,
  },
});
