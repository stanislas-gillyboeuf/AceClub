import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { getSkillLevels, type SkillLevel } from "@/lib/skill-levels";
import type { Sport } from "@/types/common";
import Animated, { FadeIn, withTiming, withDelay } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface LevelStepProps {
  sport: Sport;
  selectedLevel: string | null;
  onSelect: (level: string) => void;
}

export function LevelStep({ sport, selectedLevel, onSelect }: LevelStepProps) {
  const levels = getSkillLevels(sport);
  const isPadel = sport === "padel";

  const handleSelect = (value: string) => {
    Haptics.selectionAsync();
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          {`Et en ${isPadel ? "padel" : "tennis"}, quel est ton niveau ?`}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          {isPadel
            ? "Ça nous aide à te trouver les meilleurs matchs."
            : "Sélectionne ton classement pour des matchs équilibrés."}
        </Animated.Text>
      </View>

      {isPadel ? (
        <PadelGrid
          levels={levels}
          selectedLevel={selectedLevel}
          onSelect={handleSelect}
        />
      ) : (
        <TennisList
          levels={levels}
          selectedLevel={selectedLevel}
          onSelect={handleSelect}
        />
      )}
    </View>
  );
}

function PadelGrid({
  levels,
  selectedLevel,
  onSelect,
}: {
  levels: SkillLevel[];
  selectedLevel: string | null;
  onSelect: (value: string) => void;
}) {
  const padelIcons = ["1", "2", "3", "4"];

  return (
    <View style={styles.grid}>
      {levels.map((level, index) => {
        const isSelected = selectedLevel === level.value;
        return (
          <Animated.View
            key={level.value}
            entering={() => {
              'worklet';
              const d = 300 + index * 100;
              return {
                initialValues: { opacity: 0, transform: [{ scale: 0.96 }] },
                animations: {
                  opacity: withDelay(d, withTiming(1, { duration: 350 })),
                  transform: [{ scale: withDelay(d, withTiming(1, { duration: 400 })) }],
                },
              };
            }}
            style={styles.gridItem}
          >
            <Pressable
              onPress={() => onSelect(level.value)}
              style={({ pressed }) => [
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <GlassView style={styles.padelTile}>
                {isSelected && (
                  <View style={styles.tileCheck}>
                    <Check size={12} color={colors.white} />
                  </View>
                )}
                <View
                  style={[
                    styles.padelIconCircle,
                    isSelected && styles.padelIconCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.padelIconText,
                      isSelected && styles.padelIconTextSelected,
                    ]}
                  >
                    {padelIcons[index]}
                  </Text>
                </View>
                <Text style={styles.padelLabel}>{level.displayName}</Text>
              </GlassView>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

function TennisList({
  levels,
  selectedLevel,
  onSelect,
}: {
  levels: SkillLevel[];
  selectedLevel: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.tennisListContent}
      showsVerticalScrollIndicator={false}
    >
      {levels.map((level) => {
        const isSelected = selectedLevel === level.value;
        return (
          <Pressable
            key={level.value}
            onPress={() => onSelect(level.value)}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <GlassView style={styles.tennisRow}>
              <View
                style={[
                  styles.tennisDot,
                  isSelected && styles.tennisDotSelected,
                ]}
              />
              <Text
                style={[
                  styles.tennisLabel,
                  isSelected && styles.tennisLabelSelected,
                ]}
              >
                {level.displayName}
              </Text>
              {isSelected && (
                <View style={styles.tennisCheck}>
                  <Check size={14} color={colors.white} />
                </View>
              )}
            </GlassView>
          </Pressable>
        );
      })}
    </ScrollView>
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
  // Padel grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  gridItem: {
    width: "47%",
  },
  padelTile: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  tileCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  padelIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  padelIconCircleSelected: {
    backgroundColor: `${colors.accentGreen}20`,
  },
  padelIconText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray500,
  },
  padelIconTextSelected: {
    color: colors.accentGreen,
  },
  padelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  // Tennis list
  tennisListContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 6,
  },
  tennisRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  tennisDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray300,
  },
  tennisDotSelected: {
    backgroundColor: colors.accentGreen,
  },
  tennisLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
  },
  tennisLabelSelected: {
    fontWeight: "600",
    color: colors.accentGreen,
  },
  tennisCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
