import { useEffect } from "react";
import { View } from "@/tw";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { cn } from "@/lib/cn";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width,
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number | undefined,
          height,
          borderRadius,
        },
        animatedStyle,
      ]}
      className={cn("bg-bg-secondary dark:bg-bg-secondary-dark", className)}
    />
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-3 px-horizontal">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Skeleton width={44} height={44} borderRadius={22} />
          <View className="flex-1 gap-2">
            <Skeleton height={16} borderRadius={4} />
            <Skeleton width="60%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}
