import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = 4 }: SkeletonProps) {
  const scheme = useColorScheme();
  const shimmer = useSharedValue(0.3);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: semanticColors.skeleton[scheme],
        },
        animatedStyle,
      ]}
    />
  );
}

interface SkeletonRowProps {
  showAvatar?: boolean;
  lineCount?: number;
}

export function SkeletonRow({
  showAvatar = true,
  lineCount = 2,
}: SkeletonRowProps) {
  return (
    <View style={styles.row}>
      {showAvatar && <Skeleton width={40} height={40} borderRadius={20} />}
      <View style={styles.lines}>
        <Skeleton width={150} height={14} borderRadius={4} />
        {lineCount >= 2 && (
          <Skeleton width={100} height={12} borderRadius={4} />
        )}
        {lineCount >= 3 && (
          <Skeleton width={120} height={12} borderRadius={4} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
});
