import { type ReactNode } from "react";
import { Pressable, View, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii } from "@/constants/theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, style, onPress }: CardProps) {
  const scheme = useColorScheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardStyle: ViewStyle = {
    backgroundColor: semanticColors.cardBackground[scheme],
    borderColor: semanticColors.borderColor[scheme],
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 150 });
          opacity.value = withTiming(0.85, { duration: 150 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
          opacity.value = withTiming(1, { duration: 150 });
        }}
        style={[styles.card, cardStyle, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
});
