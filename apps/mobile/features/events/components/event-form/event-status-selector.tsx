import { View, Text, Pressable, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { semanticColors, radii } from "@/constants/theme";
import { EVENT_STATUS_CONFIG } from "@/features/events/lib/event-status";
import type { EventStatus } from "@/types/event";

interface EventStatusSelectorProps {
  value: EventStatus;
  onChange: (status: EventStatus) => void;
  scheme: "light" | "dark";
}

export function EventStatusSelector({ value, onChange, scheme }: EventStatusSelectorProps) {
  return (
    <GlassView style={styles.container}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
        STATUT
      </Text>
      <View style={styles.grid}>
        {EVENT_STATUS_CONFIG.map((opt) => {
          const isActive = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, isActive && { backgroundColor: `${opt.color}20` }]}
            >
              <View style={[styles.dot, { backgroundColor: opt.color }]} />
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? opt.color : semanticColors.labelSecondary[scheme] },
                  isActive && { fontWeight: "700" },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
