import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";

const memojis = [
  require("@/assets/images/memojis/ed-black.png"),
  require("@/assets/images/memojis/ed-white.png"),
  require("@/assets/images/memojis/francis.png"),
  require("@/assets/images/memojis/george.png"),
  require("@/assets/images/memojis/mattew.png"),
  require("@/assets/images/memojis/michael.png"),
];

// Player pin positions (percentage-based for responsiveness)
const playerPositions = [
  { top: "12%", left: "15%" },
  { top: "8%", right: "20%" },
  { top: "45%", left: "8%" },
  { top: "38%", right: "10%" },
  { top: "72%", left: "22%" },
  { top: "68%", right: "18%" },
] as const;

// Simulated street lines
const streets = [
  { top: "25%", left: 0, right: 0, height: 1 },
  { top: "50%", left: 0, right: 0, height: 1 },
  { top: "75%", left: 0, right: 0, height: 1 },
  { top: 0, bottom: 0, left: "30%", width: 1 },
  { top: 0, bottom: 0, left: "65%", width: 1 },
] as const;

function PulseRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(2.2, { duration: 1500 }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.4, { duration: 0 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseRing, animatedStyle]} />;
}

function PlayerPin({ index }: { index: number }) {
  const pos = playerPositions[index];
  return (
    <View style={[styles.playerPin, pos as any]}>
      <Image source={memojis[index]} style={styles.playerAvatar} />
    </View>
  );
}

export function LocationIllustration() {
  return (
    <View style={styles.map}>
      {/* Street lines */}
      {streets.map((street, i) => (
        <View
          key={i}
          style={[
            styles.street,
            street as any,
            { position: "absolute" },
          ]}
        />
      ))}

      {/* Player pins */}
      {memojis.map((_, index) => (
        <PlayerPin key={index} index={index} />
      ))}

      {/* Central club marker */}
      <View style={styles.clubContainer}>
        <PulseRing />
        <View style={styles.clubMarker}>
          <Text style={styles.clubIcon}>🎾</Text>
        </View>
        <View style={styles.clubLabel}>
          <Text style={styles.clubLabelText}>Club</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: colors.gray100,
    alignSelf: "center",
    overflow: "hidden",
    position: "relative",
  },
  street: {
    backgroundColor: colors.gray200,
  },
  playerPin: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  playerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  clubContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  pulseRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentGreen,
  },
  clubMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  clubIcon: {
    fontSize: 22,
  },
  clubLabel: {
    marginTop: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  clubLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accentGreen,
  },
});
