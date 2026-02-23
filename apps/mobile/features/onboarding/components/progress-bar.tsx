import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

const TOTAL_STEPS = 9;

interface ProgressBarProps {
  currentStep: number; // 0-8 (name, gender, birthdate, club, sport, level, photo, notifications, location)
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = (currentStep + 1) / TOTAL_STEPS;

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as any, { duration: 350, easing: Easing.out(Easing.cubic) }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
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
    backgroundColor: colors.accentGreen,
  },
});
