import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const TOTAL_STEPS = 5;

interface ProgressBarProps {
  currentStep: number; // 1-5 (steps after welcome)
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <Capsule key={i} filled={i < currentStep} />
      ))}
    </View>
  );
}

function Capsule({ filled }: { filled: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(filled ? colors.accentGreen : "transparent", {
      duration: 300,
    }),
    borderColor: withTiming(filled ? colors.accentGreen : colors.gray300, {
      duration: 300,
    }),
    transform: [{ scaleY: withSpring(filled ? 1 : 0.9) }],
  }));

  return <Animated.View style={[styles.capsule, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  capsule: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
});
