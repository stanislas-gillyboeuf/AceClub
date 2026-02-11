import { type PressableProps } from "react-native";
import { Pressable } from "@/tw";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  scaleValue?: number;
  className?: string;
  children: React.ReactNode;
}

export function AnimatedPressable({
  scaleValue = 0.97,
  children,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, { damping: 15, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(e);
      }}
      style={animatedStyle}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
