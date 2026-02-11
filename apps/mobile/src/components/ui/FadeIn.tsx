import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

export function FadeIn({ children, duration = 250, delay = 0 }: FadeInProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.quad),
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
