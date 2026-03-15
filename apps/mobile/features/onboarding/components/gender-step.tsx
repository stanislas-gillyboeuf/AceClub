import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import Animated, { FadeIn, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Gender = "male" | "female" | "other";

interface GenderStepProps {
  selectedGender: Gender | null;
  onSelect: (gender: Gender) => void;
  firstName: string;
}

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: "male", label: "Homme", emoji: "👨" },
  { value: "female", label: "Femme", emoji: "👩" },
  { value: "other", label: "Autre", emoji: "🧑" },
];

export function GenderStep({ selectedGender, onSelect, firstName }: GenderStepProps) {
  const handleSelect = (gender: Gender) => {
    Haptics.selectionAsync();
    onSelect(gender);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          {firstName ? `${firstName}, quel est ton genre ?` : "Quel est ton genre ?"}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          Cette information reste confidentielle.
        </Animated.Text>
      </View>

      <View style={styles.cards}>
        {GENDERS.map((g, index) => (
          <GenderCard
            key={g.value}
            label={g.label}
            emoji={g.emoji}
            isSelected={selectedGender === g.value}
            onPress={() => handleSelect(g.value)}
            delay={300 + index * 150}
          />
        ))}
      </View>
    </View>
  );
}

function GenderCard({
  label,
  emoji,
  isSelected,
  onPress,
  delay,
}: {
  label: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isSelected ? 1.02 : 1, { duration: 200 }) }],
  }));

  return (
    <Animated.View
      entering={() => {
        'worklet';
        return {
          initialValues: { opacity: 0, transform: [{ scale: 0.96 }] },
          animations: {
            opacity: withDelay(delay, withTiming(1, { duration: 350 })),
            transform: [{ scale: withDelay(delay, withTiming(1, { duration: 400 })) }],
          },
        };
      }}
      style={[{ flex: 1 }, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <GlassView style={styles.card}>
          {isSelected && (
            <View style={styles.checkBadge}>
              <Check size={14} color={colors.white} />
            </View>
          )}

          <View style={[styles.emojiCircle, isSelected && styles.emojiCircleSelected]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          <Text style={styles.cardLabel}>{label}</Text>
        </GlassView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray500,
    lineHeight: 22,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emojiCircleSelected: {
    backgroundColor: `${colors.accentGreen}12`,
  },
  emoji: {
    fontSize: 36,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },
});
