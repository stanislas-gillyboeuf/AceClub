import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radii } from "@/constants/theme";
import { CircleDot, Check } from "lucide-react-native";
import { StepHeader } from "./step-header";
import type { Sport } from "@/types/common";
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const SPORT_BLUE = "#3B82F6";

interface SportStepProps {
  selectedSport: Sport | null;
  onSelect: (sport: Sport) => void;
}

export function SportStep({ selectedSport, onSelect }: SportStepProps) {
  const handleSelect = (sport: Sport) => {
    Haptics.selectionAsync();
    onSelect(sport);
  };

  return (
    <View style={styles.container}>
      <StepHeader
        icon={CircleDot}
        title="Choisis ton sport"
        subtitle="Tu pourras toujours changer plus tard"
      />

      <View style={styles.cards}>
        <SportCard
          sport="tennis"
          label="Tennis"
          subtitle="Balle jaune"
          emoji="🎾"
          color={colors.accentOrange}
          isSelected={selectedSport === "tennis"}
          onPress={() => handleSelect("tennis")}
          delay={200}
        />
        <SportCard
          sport="padel"
          label="Padel"
          subtitle="Entre 4 murs"
          emoji="🏸"
          color={SPORT_BLUE}
          isSelected={selectedSport === "padel"}
          onPress={() => handleSelect("padel")}
          delay={350}
        />
      </View>
    </View>
  );
}

function SportCard({
  label,
  subtitle,
  emoji,
  color,
  isSelected,
  onPress,
  delay,
}: {
  sport: Sport;
  label: string;
  subtitle: string;
  emoji: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 1.02 : 1) }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={[{ flex: 1 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          isSelected && { borderColor: color, borderWidth: 2 },
        ]}
      >
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: color }]}>
            <Check size={14} color={colors.white} />
          </View>
        )}

        <View style={[styles.emojiCircle, { backgroundColor: `${color}15` }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.gray100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
