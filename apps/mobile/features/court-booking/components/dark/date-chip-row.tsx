import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
import { nextDays, formatChipWeekday, toDateKey } from "../../lib/date";

interface DateChipRowProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DateChipRow({ selectedDate, onSelect }: DateChipRowProps) {
  const days = nextDays(7);
  const selectedKey = toDateKey(selectedDate);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day, index) => {
        const isSelected = toDateKey(day) === selectedKey;
        return (
          <Pressable
            key={toDateKey(day)}
            onPress={() => onSelect(day)}
            style={[
              styles.chip,
              { backgroundColor: isSelected ? courtColors.ball : courtColors.ink2 },
            ]}
          >
            <Text
              style={[styles.weekday, { color: isSelected ? courtColors.ink : courtColors.mist }]}
            >
              {formatChipWeekday(day, index)}
            </Text>
            <Text style={[styles.day, { color: isSelected ? courtColors.ink : courtColors.chalk }]}>
              {day.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    minWidth: 60,
    gap: 2,
  },
  weekday: {
    fontFamily: courtFonts.bodyMedium,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  day: {
    fontFamily: courtFonts.mono,
    fontSize: 18,
  },
});
