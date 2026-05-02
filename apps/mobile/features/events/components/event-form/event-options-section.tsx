import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { Eye, Users } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii } from "@/constants/theme";
import { VISIBILITY_OPTIONS } from "@/features/events/lib/event-status";
import type { EventVisibility } from "@/types/event";

interface EventOptionsSectionProps {
  visibility: EventVisibility;
  onVisibilityChange: (value: EventVisibility) => void;
  capacityText: string;
  onCapacityChange: (text: string) => void;
  scheme: "light" | "dark";
}

export function EventOptionsSection({
  visibility,
  onVisibilityChange,
  capacityText,
  onCapacityChange,
  scheme,
}: EventOptionsSectionProps) {
  return (
    <GlassView style={styles.container}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
        OPTIONS
      </Text>

      <View style={styles.row}>
        <Eye size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
        <Text style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}>
          Visibilité
        </Text>
        <View style={styles.picker}>
          {VISIBILITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => onVisibilityChange(opt.value)}
              style={[styles.option, visibility === opt.value && styles.optionActive]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      visibility === opt.value
                        ? "#FFFFFF"
                        : semanticColors.labelSecondary[scheme],
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

      <View style={styles.row}>
        <Users size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
        <Text style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}>
          Capacité
        </Text>
        <TextInput
          value={capacityText}
          onChangeText={onCapacityChange}
          placeholder="Illimité"
          placeholderTextColor={semanticColors.labelTertiary[scheme]}
          keyboardType="number-pad"
          style={[styles.capacityInput, { color: semanticColors.labelPrimary[scheme] }]}
        />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 16,
  },
  picker: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionActive: {
    backgroundColor: colors.accentGreen,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  capacityInput: {
    fontSize: 16,
    textAlign: "right",
    width: 80,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
