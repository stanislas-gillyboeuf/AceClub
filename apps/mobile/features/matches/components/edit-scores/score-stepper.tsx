import { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeOutUp,
  FadeOutDown,
} from "react-native-reanimated";
import { Minus, Plus } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { radii, semanticColors } from "@/constants/theme";
import * as Haptics from "expo-haptics";

const SLIDE_DISTANCE = 20;
const DURATION = 150;

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
  const prevValue = useRef(value);
  const isInitial = useRef(true);

  // Determine direction
  const goingUp = value > prevValue.current;
  prevValue.current = value;

  // Skip animation on first render
  const shouldAnimate = !isInitial.current;
  isInitial.current = false;

  // Score goes UP → old exits down, new enters from top
  // Score goes DOWN → old exits up, new enters from bottom
  const entering = shouldAnimate
    ? goingUp
      ? FadeInUp.duration(DURATION).withInitialValues({ transform: [{ translateY: -SLIDE_DISTANCE }], opacity: 0 })
      : FadeInDown.duration(DURATION).withInitialValues({ transform: [{ translateY: SLIDE_DISTANCE }], opacity: 0 })
    : undefined;

  const exiting = goingUp
    ? FadeOutDown.duration(DURATION).withInitialValues({ transform: [{ translateY: 0 }], opacity: 1 })
    : FadeOutUp.duration(DURATION).withInitialValues({ transform: [{ translateY: 0 }], opacity: 1 });

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

  const bgColor = semanticColors.systemGray6[scheme];
  const textColor = semanticColors.labelPrimary[scheme];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
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

      <View style={styles.valueContainer}>
        <Animated.Text
          key={value}
          entering={entering}
          exiting={exiting}
          style={[styles.value, { color: textColor }]}
        >
          {value}
        </Animated.Text>
      </View>

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
  valueContainer: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
    overflow: "hidden",
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
