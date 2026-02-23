import { View, Text, Pressable, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { SENSATIONS } from "@/features/matches/constants/sensations";

interface SensationPickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function SensationPicker({ selected, onSelect }: SensationPickerProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.row}>
      {SENSATIONS.map((sensation) => {
        const isSelected = selected === sensation.id;
        return (
          <Pressable
            key={sensation.id}
            onPress={() => onSelect(sensation.id)}
            style={({ pressed }) => [
              styles.wrapper,
              pressed && styles.pressed,
            ]}
          >
            <GlassView
              style={styles.button}
              tintColor={isSelected ? colors.accentGreen : undefined}
            >
              <Text style={styles.emoji}>{sensation.emoji}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected
                      ? colors.accentGreen
                      : semanticColors.labelSecondary[scheme],
                  },
                ]}
              >
                {sensation.label}
              </Text>
            </GlassView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  wrapper: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  button: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
