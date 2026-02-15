import { View, Text, Pressable, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { radii } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface ScoreStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  accentColor: string;
}

export function ScoreStepper({
  value,
  onValueChange,
  minValue = 0,
  maxValue = 99,
  accentColor,
}: ScoreStepperProps) {
  const scheme = useColorScheme();
  const canDecrement = value > minValue;
  const canIncrement = value < maxValue;

  const decrement = () => {
    if (canDecrement) {
      onValueChange(value - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const increment = () => {
    if (canIncrement) {
      onValueChange(value + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const bgColor = scheme === "light" ? "#F2F2F7" : "#1C1C1E";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Minus button */}
      <Pressable
        onPress={decrement}
        disabled={!canDecrement}
        style={[
          styles.button,
          canDecrement && { backgroundColor: `${accentColor}26` },
        ]}
      >
        <Minus
          size={18}
          color={canDecrement ? accentColor : `${scheme === "light" ? "#8E8E93" : "#48484A"}66`}
          strokeWidth={2.5}
        />
      </Pressable>

      {/* Value */}
      <Text style={[styles.value, { color: scheme === "light" ? "#000" : "#FFF" }]}>
        {value}
      </Text>

      {/* Plus button */}
      <Pressable
        onPress={increment}
        disabled={!canIncrement}
        style={[
          styles.button,
          canIncrement && { backgroundColor: `${accentColor}26` },
        ]}
      >
        <Plus
          size={18}
          color={canIncrement ? accentColor : `${scheme === "light" ? "#8E8E93" : "#48484A"}66`}
          strokeWidth={2.5}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radii.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    minWidth: 56,
  },
});
