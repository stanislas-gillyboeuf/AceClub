import { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { EFFORT_LEVELS } from "@/features/matches/constants/sensations";
import { TennisBall } from "./tennis-ball";

const BALL_SIZE = 52;
const BALL_GAP = 16;
const INACTIVE_COLOR = "#2C2C2E";
const SNAP_THRESHOLD = 40;
const TIMING = { duration: 150, easing: Easing.out(Easing.quad) };

interface EffortPickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function EffortPicker({ selected, onSelect }: EffortPickerProps) {
  const scheme = useColorScheme();

  const selectedLevel = EFFORT_LEVELS.find((e) => e.id === selected);
  const selectedValue = selectedLevel?.value ?? 0;
  const selectedIndex = selectedLevel
    ? EFFORT_LEVELS.findIndex((e) => e.id === selected)
    : -1;

  const translateX = useSharedValue(0);

  const selectByIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, EFFORT_LEVELS.length - 1));
      const level = EFFORT_LEVELS[clamped];
      if (level.id !== selected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(level.id);
      }
    },
    [selected, onSelect],
  );

  const handleTap = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(id);
    },
    [onSelect],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])
        .onUpdate((e) => {
          translateX.value = e.translationX;
        })
        .onEnd((e) => {
          translateX.value = withTiming(0, TIMING);

          if (Math.abs(e.translationX) > SNAP_THRESHOLD) {
            // swipe right = go lower (index - 1), swipe left = go higher (index + 1)
            const direction = e.translationX > 0 ? -1 : 1;
            const base = selectedIndex >= 0 ? selectedIndex : 0;
            runOnJS(selectByIndex)(base + direction);
          }
        }),
    [selectedIndex, selectByIndex],
  );

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          {selectedLevel ? selectedLevel.description : "Évalue ton effort"}
        </Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.ballsRow, rowAnimatedStyle]}>
          {EFFORT_LEVELS.map((level, index) => {
            const isActive = selectedValue >= level.value;
            const isSelected = selected === level.id;

            return (
              <Pressable key={level.id} onPress={() => handleTap(level.id)} hitSlop={8}>
                <BallItem
                  isSelected={isSelected}
                  isActive={isActive}
                  translateX={translateX}
                  index={index}
                  selectedIndex={selectedIndex}
                />
              </Pressable>
            );
          })}
        </Animated.View>
      </GestureDetector>

      {selectedLevel && (
        <GlassView style={styles.labelCard}>
          <Text style={[styles.labelText, { color: semanticColors.labelPrimary[scheme] }]}>
            {selectedLevel.label}
          </Text>
          <View style={styles.progressRow}>
            {EFFORT_LEVELS.map((level) => (
              <View
                key={level.id}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      selectedValue >= level.value
                        ? colors.accentGreen
                        : semanticColors.labelTertiary[scheme],
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.percentageText, { color: semanticColors.labelSecondary[scheme] }]}>
            {selectedLevel.percentage}
          </Text>
        </GlassView>
      )}
    </View>
  );
}

function BallItem({
  isSelected,
  isActive,
  translateX,
  index,
  selectedIndex,
}: {
  isSelected: boolean;
  isActive: boolean;
  translateX: Animated.SharedValue<number>;
  index: number;
  selectedIndex: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(index - selectedIndex);
    const parallax = interpolate(
      translateX.value,
      [-200, 0, 200],
      [distance * -4, 0, distance * 4],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { scale: withTiming(isSelected ? 1.15 : isActive ? 1 : 0.85, TIMING) },
        { translateX: parallax },
      ],
      opacity: withTiming(isActive ? 1 : 0.35, TIMING),
    };
  });

  return (
    <Animated.View style={[styles.ballWrapper, animatedStyle]}>
      <TennisBall
        size={BALL_SIZE}
        color={isActive ? colors.accentGreen : INACTIVE_COLOR}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  ballsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: BALL_GAP,
  },
  ballWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 16,
    borderRadius: radii.md,
    marginHorizontal: spacing.horizontal,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
  },
  progressDot: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  percentageText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
