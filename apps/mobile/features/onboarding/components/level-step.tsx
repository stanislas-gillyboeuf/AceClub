import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { onboardingColors } from "../theme";
import { SelectableCard } from "./selectable-card";
import { fftGroups } from "../lib/fft-groups";
import { padelLevels } from "@/lib/skill-levels";
import type { Sport } from "@/types/common";

const GENERIC_LEVELS = ["Débutant", "Intermédiaire", "Confirmé"] as const;
type GenericLevel = (typeof GENERIC_LEVELS)[number];

interface LevelStepProps {
  sport: Sport;
  selectedLevel: string | null;
  onSelect: (level: string) => void;
}

export function LevelStep({ sport, selectedLevel, onSelect }: LevelStepProps) {
  const isPadel = sport === "padel";
  const isGeneric = selectedLevel != null && (GENERIC_LEVELS as readonly string[]).includes(selectedLevel);
  const hasPreciseLevel = selectedLevel != null && !isGeneric;
  const [showClassement, setShowClassement] = useState(hasPreciseLevel);

  const handleSelectGeneric = (level: GenericLevel) => {
    Haptics.selectionAsync();
    setShowClassement(false);
    onSelect(level);
  };

  const handleOpenClassement = () => {
    Haptics.selectionAsync();
    setShowClassement(true);
  };

  const handleSelectPrecise = (value: string) => {
    Haptics.selectionAsync();
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text entering={FadeIn.delay(100).duration(400)} style={styles.title}>
          {`Et en ${isPadel ? "padel" : "tennis"}, quel est ton niveau ?`}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(250).duration(400)} style={styles.subtitle}>
          Ça nous aide à te trouver des matchs équilibrés.
        </Animated.Text>
      </View>

      <ScrollView contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>
        {GENERIC_LEVELS.map((level) => (
          <SelectableCard
            key={level}
            label={level}
            height={76}
            selected={selectedLevel === level}
            onPress={() => handleSelectGeneric(level)}
          />
        ))}
        <SelectableCard
          label="Je suis classé(e)"
          height={76}
          selected={hasPreciseLevel || showClassement}
          onPress={handleOpenClassement}
        />

        {showClassement &&
          (isPadel ? (
            <PadelGrid selectedLevel={selectedLevel} onSelect={handleSelectPrecise} />
          ) : (
            <TennisClassementGroups selectedLevel={selectedLevel} onSelect={handleSelectPrecise} />
          ))}
      </ScrollView>
    </View>
  );
}

function TennisClassementGroups({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.classementWrap}>
      {fftGroups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <View style={styles.groupRow}>
            {group.levels.map((level) => {
              const isSelected = selectedLevel === level.value;
              return (
                <Pressable
                  key={level.value}
                  onPress={() => onSelect(level.value)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {level.displayName}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function PadelGrid({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.classementWrap}>
      <View style={styles.groupRow}>
        {padelLevels.map((level) => {
          const isSelected = selectedLevel === level.value;
          return (
            <Pressable
              key={level.value}
              onPress={() => onSelect(level.value)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <View style={[styles.padelTile, isSelected && styles.chipSelected]}>
                {isSelected && (
                  <View style={styles.padelCheck}>
                    <Check size={10} color={onboardingColors.accentForeground} />
                  </View>
                )}
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {level.displayName}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: onboardingColors.fg,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: onboardingColors.fgDim,
    lineHeight: 22,
  },
  cards: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  classementWrap: {
    marginTop: 4,
    gap: 16,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: onboardingColors.fgDim,
  },
  groupRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
  },
  chipSelected: {
    backgroundColor: onboardingColors.cardBgSelected,
    borderColor: onboardingColors.cardBorderSelected,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: onboardingColors.fg,
  },
  chipTextSelected: {
    color: onboardingColors.accent,
  },
  padelTile: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    position: "relative",
  },
  padelCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: onboardingColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
