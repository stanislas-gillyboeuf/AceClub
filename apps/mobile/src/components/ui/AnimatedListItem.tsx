import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
}

export function AnimatedListItem({
  children,
  index,
  delay = 50,
}: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(
      index * delay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      index * delay,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
