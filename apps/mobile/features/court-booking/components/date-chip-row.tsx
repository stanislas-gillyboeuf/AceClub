import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { nextDays, formatChipWeekday, toDateKey } from "../lib/date";

interface DateChipRowProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DateChipRow({ selectedDate, onSelect }: DateChipRowProps) {
  const scheme = useColorScheme();
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
          <Pressable key={toDateKey(day)} onPress={() => onSelect(day)}>
            <GlassView
              style={styles.chip}
              tintColor={isSelected ? colors.accentGreen : undefined}
            >
              <Text
                style={[
                  styles.weekday,
                  {
                    color: isSelected
                      ? "#FFFFFF"
                      : semanticColors.labelSecondary[scheme],
                  },
                ]}
              >
                {formatChipWeekday(day, index)}
              </Text>
              <Text
                style={[
                  styles.day,
                  {
                    color: isSelected
                      ? "#FFFFFF"
                      : semanticColors.labelPrimary[scheme],
                  },
                ]}
              >
                {day.getDate()}
              </Text>
            </GlassView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: spacing.horizontal,
  },
  chip: {
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    minWidth: 64,
    gap: 2,
  },
  weekday: {
    fontSize: 12,
    fontWeight: "500",
  },
  day: {
    fontSize: 17,
    fontWeight: "700",
  },
});
