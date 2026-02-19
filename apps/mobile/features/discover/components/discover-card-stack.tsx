import { useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DiscoverCard } from "./discover-card";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MatchIntentWithUser } from "@/types/match-intent";

const SWIPE_THRESHOLD = 100;
const MAX_ROTATION = 12;
const CARD_STACK_SPACING = 8;
const MAX_VISIBLE_CARDS = 3;

interface DiscoverCardStackProps {
  items: MatchIntentWithUser[];
  isLoading: boolean;
  isSwiping: boolean;
  matchMessage: string | null;
  didMatch: boolean;
  onLike: () => void;
  onPass: () => void;
  onCardPress: (item: MatchIntentWithUser) => void;
  onCreateIntent: () => void;
}

export function DiscoverCardStack({
  items,
  isLoading,
  isSwiping,
  matchMessage,
  didMatch,
  onLike,
  onPass,
  onCardPress,
  onCreateIntent,
}: DiscoverCardStackProps) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const topCard = items.length > 0 ? items[0] : null;
  const topCardId = topCard?.intent.id;

  // Reset position when the top card changes (after swipe removal)
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [topCardId, translateX, translateY]);

  const handleSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      if (direction === "right") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLike();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPass();
      }
    },
    [onLike, onPass]
  );

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [translateX, translateY]);

  const animateSwipeOut = useCallback(
    (direction: "left" | "right") => {
      const targetX = direction === "right" ? 500 : -500;
      translateX.value = withTiming(targetX, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    },
    [translateX, translateY]
  );

  const panGesture = Gesture.Pan()
    .enabled(!isSwiping && topCard !== null)
    .minDistance(10)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(animateSwipeOut)("right");
        runOnJS(handleSwipeComplete)("right");
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(animateSwipeOut)("left");
        runOnJS(handleSwipeComplete)("left");
      } else {
        runOnJS(resetPosition)();
      }
    });

  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    const alpha = Math.round(progress * 0.8 * 1000) / 1000;
    const isRight = translateX.value > 0;

    return {
      borderWidth: progress * 4,
      borderColor: isRight
        ? `rgba(34, 197, 94, ${alpha})`
        : `rgba(239, 68, 68, ${alpha})`,
      borderRadius: 24,
    };
  });

  const handleLikePress = useCallback(() => {
    if (!topCard || isSwiping) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    animateSwipeOut("right");
    onLike();
  }, [topCard, isSwiping, animateSwipeOut, onLike]);

  const handlePassPress = useCallback(() => {
    if (!topCard || isSwiping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateSwipeOut("left");
    onPass();
  }, [topCard, isSwiping, animateSwipeOut, onPass]);

  // Reset position when the top card changes
  const handleCardPress = useCallback(() => {
    if (topCard) onCardPress(topCard);
  }, [topCard, onCardPress]);

  return (
    <View style={styles.container}>
      {/* Match banner */}
      {didMatch && matchMessage && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchEmoji}>{"\uD83D\uDE4C"}</Text>
          <Text style={[styles.matchText, { color: semanticColors.labelPrimary[scheme] }]}>
            {matchMessage}
          </Text>
        </View>
      )}

      {/* Card area */}
      <View style={styles.cardArea}>
        {items.length === 0 && !isLoading ? (
          <View style={[styles.emptyContainer, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
            <EmptyState
              icon="UsersRound"
              title="Plus de profils pour l'instant"
              description="Reviens plus tard pour découvrir de nouveaux joueurs de ton club."
            />
            <Pressable
              style={[styles.createButton, { backgroundColor: colors.accentGreen }]}
              onPress={onCreateIntent}
            >
              <Text style={styles.createButtonText}>Créer une annonce</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Background cards */}
            {items.slice(1, MAX_VISIBLE_CARDS).reverse().map((item, reversedIndex) => {
              const actualIndex = MAX_VISIBLE_CARDS - 1 - reversedIndex;
              const scale = 1 - 0.04 * actualIndex;
              const offsetY = actualIndex * CARD_STACK_SPACING;

              return (
                <View
                  key={item.intent.id}
                  style={[
                    styles.stackedCard,
                    {
                      transform: [{ scale }, { translateY: offsetY }],
                      zIndex: MAX_VISIBLE_CARDS - actualIndex,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <DiscoverCard item={item} />
                </View>
              );
            })}

            {/* Top card with gestures */}
            {topCard && (
              <GestureDetector gesture={panGesture}>
                <Animated.View
                  style={[styles.stackedCard, topCardAnimatedStyle, { zIndex: MAX_VISIBLE_CARDS }]}
                >
                  <Pressable onPress={handleCardPress}>
                    <Animated.View style={glowAnimatedStyle}>
                      <DiscoverCard item={topCard} />
                    </Animated.View>
                  </Pressable>
                </Animated.View>
              </GestureDetector>
            )}
          </>
        )}
      </View>

      {/* Action buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handlePassPress}
          disabled={!topCard || isSwiping}
        >
          <GlassView style={styles.passButton}>
            <X
              size={24}
              color={!topCard || isSwiping ? semanticColors.labelTertiary[scheme] : semanticColors.labelSecondary[scheme]}
              strokeWidth={2.5}
            />
          </GlassView>
        </Pressable>

        <Pressable
          onPress={handleLikePress}
          disabled={!topCard || isSwiping}
        >
          <GlassView style={styles.likeButton} tintColor={colors.accentGreen}>
            <MaterialCommunityIcons
              name="tennis"
              size={30}
              color={!topCard || isSwiping ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
            />
          </GlassView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  matchBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 100,
    backgroundColor: `${colors.accentGreen}1A`,
  },
  matchEmoji: {
    fontSize: 16,
  },
  matchText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  stackedCard: {
    position: "absolute",
  },
  emptyContainer: {
    borderRadius: 16,
    paddingBottom: 24,
    width: "100%",
  },
  createButton: {
    marginHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
