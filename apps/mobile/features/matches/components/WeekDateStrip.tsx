import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { startOfWeek, formatShortWeekday, formatDayKey, monthYearFormatter } from "@/lib/date";

interface WeekDateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  matchCountByDay: Map<string, number>;
  onChangeWeek: (direction: -1 | 1) => void;
}

function getWeekDays(selectedDate: Date): Date[] {
  const monday = startOfWeek(selectedDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function WeekDateStrip({
  selectedDate,
  onSelectDate,
  matchCountByDay,
  onChangeWeek,
}: WeekDateStripProps) {
  const scheme = useColorScheme();
  const days = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const selectedKey = formatDayKey(selectedDate);
  const monthLabel = monthYearFormatter.format(days[3]).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable onPress={() => onChangeWeek(-1)} hitSlop={12}>
          <ChevronLeft size={20} color={semanticColors.labelSecondary[scheme]} />
        </Pressable>
        <Text style={[styles.monthText, { color: semanticColors.labelSecondary[scheme] }]}>
          {monthLabel}
        </Text>
        <Pressable onPress={() => onChangeWeek(1)} hitSlop={12}>
          <ChevronRight size={20} color={semanticColors.labelSecondary[scheme]} />
        </Pressable>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => {
          const key = formatDayKey(day);
          const isSelected = key === selectedKey;
          const hasMatches = (matchCountByDay.get(key) ?? 0) > 0;
          const textColor = isSelected ? colors.white : undefined;

          const Wrapper = isSelected ? GlassView : View;
          const wrapperProps = isSelected ? { tintColor: colors.accentGreen } : {};

          return (
            <Pressable
              key={key}
              onPress={() => onSelectDate(day)}
              style={({ pressed }) => [
                styles.dayCell,
                pressed && styles.dayCellPressed,
              ]}
            >
              <Wrapper style={styles.dayInner} {...wrapperProps}>
                <Text style={[styles.dayLabel, { color: textColor ?? semanticColors.labelSecondary[scheme] }]}>
                  {formatShortWeekday(day)}
                </Text>
                <Text style={[styles.dayNumber, { color: textColor ?? semanticColors.labelPrimary[scheme] }]}>
                  {day.getDate()}
                </Text>
              </Wrapper>
              {hasMatches && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 12,
    paddingBottom: 16,
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  daysRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  dayCellPressed: {
    transform: [{ scale: 0.95 }],
  },
  dayInner: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 52,
    borderRadius: 12,
    gap: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: "600",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen,
    marginTop: 2,
  },
});
