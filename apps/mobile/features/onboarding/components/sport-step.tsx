import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import type { Sport } from "@/types/common";
import Animated, { FadeIn, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface SportStepProps {
  selectedSports: Sport[];
  onToggle: (sport: Sport) => void;
  firstName: string;
  clubName: string | null;
}

export function SportStep({ selectedSports, onToggle, firstName, clubName }: SportStepProps) {
  const handleToggle = (sport: Sport) => {
    Haptics.selectionAsync();
    onToggle(sport);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          {firstName ? `${firstName}, quel sport pratiques-tu ?` : "Quel sport pratiques-tu ?"}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          {clubName
            ? `Tu peux choisir les deux — on a hâte de te voir sur les terrains de ${clubName}.`
            : "Tu peux choisir les deux, et tu pourras toujours changer plus tard."}
        </Animated.Text>
      </View>

      <View style={styles.cards}>
        <SportCard
          sport="tennis"
          label="Tennis"
          subtitle="Balle jaune"
          emoji="🎾"
          isSelected={selectedSports.includes("tennis")}
          onPress={() => handleToggle("tennis")}
          delay={300}
        />
        <SportCard
          sport="padel"
          label="Padel"
          subtitle="Entre 4 murs"
          emoji="🏓"
          isSelected={selectedSports.includes("padel")}
          onPress={() => handleToggle("padel")}
          delay={450}
        />
      </View>
    </View>
  );
}

function SportCard({
  label,
  subtitle,
  emoji,
  isSelected,
  onPress,
  delay,
}: {
  sport: Sport;
  label: string;
  subtitle: string;
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
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray500,
  },
});
