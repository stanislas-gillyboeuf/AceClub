import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { Timer } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, colors, spacing, radii } from "@/constants/theme";

const DIGIT_HEIGHT = 36;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.6 };

interface ElapsedTimerCardProps {
  startedAt: string;
}

interface Elapsed {
  hours: number;
  minutes: number;
  seconds: number;
}

function computeElapsed(startedAt: string): Elapsed {
  const diff = Math.max(0, Date.now() - new Date(startedAt).getTime());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Slot-machine digit: a vertical strip of 0–9, translated to show the current digit.
 * No opacity, no fade — just a smooth spring slide.
 */
function SlotDigit({
  value,
  scheme,
}: {
  value: number;
  scheme: "light" | "dark";
}) {
  const translateY = useSharedValue(-value * DIGIT_HEIGHT);

  useEffect(() => {
    translateY.value = withSpring(-value * DIGIT_HEIGHT, SPRING_CONFIG);
  }, [value]);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const textColor = semanticColors.labelPrimary[scheme];

  return (
    <View style={styles.digitWindow}>
      <Animated.View style={stripStyle}>
        {DIGITS.map((d) => (
          <View key={d} style={styles.digitCell}>
            <Text style={[styles.digitText, { color: textColor }]}>{d}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function DigitPair({
  value,
  label,
  scheme,
}: {
  value: string;
  label: string;
  scheme: "light" | "dark";
}) {
  return (
    <View style={styles.unitColumn}>
      <View
        style={[
          styles.digitPairBox,
          { backgroundColor: semanticColors.primaryBackground[scheme] },
        ]}
      >
        <SlotDigit value={parseInt(value[0], 10)} scheme={scheme} />
        <SlotDigit value={parseInt(value[1], 10)} scheme={scheme} />
      </View>
      <Text style={[styles.unitLabel, { color: semanticColors.labelSecondary[scheme] }]}>
        {label}
      </Text>
    </View>
  );
}

export function ElapsedTimerCard({ startedAt }: ElapsedTimerCardProps) {
  const scheme = useColorScheme();
  const [elapsed, setElapsed] = useState(() => computeElapsed(startedAt));

  const tick = useCallback(() => {
    setElapsed(computeElapsed(startedAt));
  }, [startedAt]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: `${colors.accentOrange}4D`,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Timer size={14} color={colors.accentOrange} strokeWidth={2} />
        <Text style={[styles.headerText, { color: colors.accentOrange }]}>
          TEMPS DE JEU
        </Text>
      </View>

      <View style={styles.timerRow}>
        <DigitPair value={pad(elapsed.hours)} label="h" scheme={scheme} />
        <Text style={[styles.colon, { color: semanticColors.labelTertiary[scheme] }]}>:</Text>
        <DigitPair value={pad(elapsed.minutes)} label="min" scheme={scheme} />
        <Text style={[styles.colon, { color: semanticColors.labelTertiary[scheme] }]}>:</Text>
        <DigitPair value={pad(elapsed.seconds)} label="sec" scheme={scheme} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unitColumn: {
    alignItems: "center",
    gap: 4,
  },
  digitPairBox: {
    flexDirection: "row",
    borderRadius: radii.sm,
    paddingHorizontal: 4,
    gap: 2,
    overflow: "hidden",
  },
  digitWindow: {
    width: 22,
    height: DIGIT_HEIGHT,
    overflow: "hidden",
  },
  digitCell: {
    height: DIGIT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unitLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  colon: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
  },
});
