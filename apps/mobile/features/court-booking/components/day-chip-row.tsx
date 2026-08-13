import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors, courtFontMono } from "../theme";
import { nextDays, formatChipWeekday, toDateKey } from "../lib/date";

interface DayChipRowProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const DAYS = nextDays(7);

export function DayChipRow({ selectedDate, onSelect }: DayChipRowProps) {
  const selectedKey = toDateKey(selectedDate);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {DAYS.map((date, index) => {
        const active = toDateKey(date) === selectedKey;
        return (
          <Pressable
            key={date.toISOString()}
            onPress={() => onSelect(date)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.dname, active && styles.textActive]}>
              {formatChipWeekday(date, index)}
            </Text>
            <Text style={[styles.dnum, active && styles.textActive]}>{date.getDate()}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  chip: {
    width: 48,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: courtColors.line,
    backgroundColor: courtColors.ink700,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  dname: {
    fontFamily: courtFontMono,
    fontSize: 8.5,
    textTransform: "uppercase",
    color: courtColors.chalkDim,
  },
  dnum: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 2,
    color: courtColors.chalk,
  },
  textActive: {
    color: courtColors.ink900,
  },
});
