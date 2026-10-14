import { View, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const scheme = useColorScheme();
  const progress = (currentStep + 1) / totalSteps;

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as any, { duration: 350, easing: Easing.out(Easing.cubic) }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: semanticColors.accentGreen[scheme] }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});
