import { View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors, courtFontMono } from "../theme";
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
        <Pressable onPress={onPrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{capitalize(monthFormatter.format(month))}</Text>
        <Pressable onPress={onNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
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
                hasBooking && styles.dayHasBooking,
                isToday && styles.dayToday,
                isSelected && styles.daySelected,
              ]}
            >
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{date.getDate()}</Text>
              {hasBooking && (
                <View
                  style={[
                    styles.calDot,
                    isPast ? styles.calDotPast : styles.calDotUpcoming,
                    isSelected && styles.calDotSelected,
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.calDot, styles.calDotUpcoming]} />
          <Text style={styles.legendText}>À venir</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.calDot, styles.calDotPast]} />
          <Text style={styles.legendText}>Passée</Text>
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
    borderColor: courtColors.line,
    backgroundColor: courtColors.ink700,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: courtColors.chalk,
    fontSize: 16,
  },
  monthLabel: {
    fontWeight: "800",
    fontSize: 17,
    color: courtColors.chalk,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  weekday: {
    width: CELL,
    textAlign: "center",
    fontFamily: courtFontMono,
    fontSize: 9.5,
    textTransform: "uppercase",
    color: courtColors.chalkFaint,
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
  dayHasBooking: {
    backgroundColor: courtColors.ink700,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: courtColors.chalkDim,
  },
  daySelected: {
    backgroundColor: courtColors.chartreuse,
  },
  dayNumber: {
    fontFamily: courtFontMono,
    fontSize: 12.5,
    color: courtColors.chalkDim,
  },
  dayNumberSelected: {
    color: courtColors.ink900,
    fontWeight: "700",
  },
  calDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  calDotUpcoming: {
    backgroundColor: courtColors.chartreuse,
  },
  calDotPast: {
    backgroundColor: courtColors.chalkFaint,
  },
  calDotSelected: {
    backgroundColor: courtColors.ink900,
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
    fontFamily: courtFontMono,
    fontSize: 11,
    color: courtColors.chalkDim,
  },
});
