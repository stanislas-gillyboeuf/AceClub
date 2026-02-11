import { View, Text, Pressable } from "@/tw";
import { useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { mediumImpact, lightImpact } from "@/lib/haptics";
import {
  MapPin,
  Clock,
  Swords,
  Dumbbell,
  ThumbsUp,
  X,
} from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchIntentDiscoverItem } from "@/types/match-intent";

const SWIPE_THRESHOLD = 120;

interface DiscoverCardProps {
  item: MatchIntentDiscoverItem;
  onSwipe: (action: "like" | "pass") => void;
  isTop: boolean;
}

export function DiscoverCard({ item, onSwipe, isTop }: DiscoverCardProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(isTop ? 1 : 0.95);

  const formatDate = (date: string | null, time: string | null) => {
    if (!date) return "Flexible";
    const d = new Date(date);
    const day = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (time) return `${day} à ${time}`;
    return day;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h${m}` : `${h}h`;
    }
    return `${minutes}min`;
  };

  const handleSwipe = (action: "like" | "pass") => {
    mediumImpact();
    onSwipe(action);
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width * 1.5, { duration: 300 });
        runOnJS(handleSwipe)("like");
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width * 1.5, { duration: 300 });
        runOnJS(handleSwipe)("pass");
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-width / 2, 0, width / 2],
          [-15, 0, 15],
          Extrapolation.CLAMP
        )}deg`,
      },
      { scale: cardScale.value },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const handleButtonSwipe = (action: "like" | "pass") => {
    lightImpact();
    const target = action === "like" ? width * 1.5 : -width * 1.5;
    translateX.value = withTiming(target, { duration: 300 });
    onSwipe(action);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[animatedStyle]}
        className="absolute inset-0 mx-horizontal"
      >
        <View className="flex-1 bg-bg-card dark:bg-bg-card-dark rounded-xl border-[0.5px] border-border dark:border-border-dark overflow-hidden">
          {/* Like / Pass overlays */}
          <Animated.View
            style={[likeOpacity]}
            className="absolute top-6 left-6 z-10 bg-primary/90 dark:bg-primary-dark/90 rounded-lg px-4 py-2 -rotate-12"
          >
            <Text className="text-white font-sans-bold text-2xl">LIKE</Text>
          </Animated.View>
          <Animated.View
            style={[passOpacity]}
            className="absolute top-6 right-6 z-10 bg-destructive/90 dark:bg-destructive-dark/90 rounded-lg px-4 py-2 rotate-12"
          >
            <Text className="text-white font-sans-bold text-2xl">PASS</Text>
          </Animated.View>

          {/* Card content */}
          <View className="flex-1 p-5 gap-4">
            {/* User header */}
            <View className="flex-row items-center gap-3">
              <Avatar
                imageUrl={item.user?.image}
                name={item.user?.name ?? "?"}
                size={56}
              />
              <View className="flex-1">
                <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark">
                  {item.user?.name ?? "Joueur"}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                    Niveau {item.user?.level ?? 1}
                  </Text>
                  {item.user?.organization && (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-label-tertiary dark:text-label-tertiary-dark">
                        ·
                      </Text>
                      {item.user.organization.logo && (
                        <Image
                          source={{ uri: item.user.organization.logo }}
                          style={{ width: 16, height: 16, borderRadius: 4 }}
                        />
                      )}
                      <Text className="text-sm font-sans text-label-secondary">
                        {item.user.organization.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Intent details */}
            <View className="bg-bg-primary/50 dark:bg-bg-primary-dark/50 rounded-lg p-4 gap-3">
              {/* Type badge */}
              <View className="flex-row items-center gap-2">
                {item.type === "match" ? (
                  <Swords size={18} color="#34C759" />
                ) : (
                  <Dumbbell size={18} color="#FF9500" />
                )}
                <Text className="text-base font-sans-semibold text-label-primary dark:text-label-primary-dark">
                  {item.type === "match" ? "Match" : "Entraînement"}
                </Text>
              </View>

              {/* Date & time */}
              <View className="flex-row items-center gap-2">
                <Clock size={16} color="#8E8E93" />
                <Text className="text-sm font-sans text-label-secondary">
                  {formatDate(item.date, item.time)} ·{" "}
                  {formatDuration(item.duration)}
                </Text>
              </View>

              {/* Distance */}
              {item.distance != null && (
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#8E8E93" />
                  <Text className="text-sm font-sans text-label-secondary">
                    à {item.distance} km
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {item.description && (
              <Text className="text-base font-sans text-label-primary dark:text-label-primary-dark leading-6">
                "{item.description}"
              </Text>
            )}

            <View className="flex-1" />

            {/* Action buttons */}
            <View className="flex-row justify-center gap-8 pb-2">
              <Pressable
                onPress={() => handleButtonSwipe("pass")}
                className="w-16 h-16 rounded-full bg-destructive/10 dark:bg-destructive-dark/10 items-center justify-center border-2 border-destructive/30 dark:border-destructive-dark/30"
              >
                <X size={28} color="#FF3B30" />
              </Pressable>
              <Pressable
                onPress={() => handleButtonSwipe("like")}
                className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10 items-center justify-center border-2 border-primary/30 dark:border-primary-dark/30"
              >
                <ThumbsUp size={28} color="#34C759" />
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
