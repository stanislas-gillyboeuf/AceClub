import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "../theme";
import { nextDays, formatChipWeekday, toDateKey } from "../lib/date";

interface DayChipRowProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  /** How many days ahead are selectable — from the club's booking window setting (default 7). */
  dayCount?: number;
}

export function DayChipRow({ selectedDate, onSelect, dayCount = 7 }: DayChipRowProps) {
  const scheme = useColorScheme();
  const selectedKey = toDateKey(selectedDate);
  const DAYS = nextDays(dayCount);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {DAYS.map((date, index) => {
        const active = toDateKey(date) === selectedKey;
        return (
          <Pressable
            key={date.toISOString()}
            onPress={() => onSelect(date)}
            style={[
              styles.chip,
              {
                borderColor: active ? bookingGreen.bright : semanticColors.borderColor[scheme],
                backgroundColor: active ? bookingGreen.bright : semanticColors.systemGray6[scheme],
              },
            ]}
          >
            <Text
              style={[
                styles.dname,
                { color: active ? bookingGreen.onBright : semanticColors.labelSecondary[scheme] },
              ]}
            >
              {formatChipWeekday(date, index)}
            </Text>
            <Text
              style={[
                styles.dnum,
                { color: active ? bookingGreen.onBright : semanticColors.labelPrimary[scheme] },
              ]}
            >
              {date.getDate()}
            </Text>
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
    alignItems: "center",
  },
  dname: {
    fontSize: 8.5,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dnum: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 2,
  },
});
