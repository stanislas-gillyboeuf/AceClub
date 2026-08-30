import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

const COLORS = [colors.accentGreen, colors.accentOrange, colors.gray400];
const COUNT = 10;

function Particle({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const left = 10 + Math.random() * 80;
  const delay = Math.random() * 150;
  const color = COLORS[index % COLORS.length];
  const rotateTo = 300 + Math.random() * 80;

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.in(Easing.quad) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * 240 },
      { rotate: `${progress.value * rotateTo}deg` },
    ],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.View
      style={[styles.particle, style, { left: `${left}%`, backgroundColor: color }]}
      pointerEvents="none"
    />
  );
}

export function ConfettiBurst() {
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle key={i} index={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    top: -10,
    width: 6,
    height: 12,
    borderRadius: 1,
  },
});
