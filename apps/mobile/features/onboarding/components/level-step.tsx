import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { colors, radii } from "@/constants/theme";
import { BarChart3, Check } from "lucide-react-native";
import { StepHeader } from "./step-header";
import { getSkillLevels, type SkillLevel } from "@/lib/skill-levels";
import type { Sport } from "@/types/common";
import Animated, { FadeInDown } from "react-native-reanimated";
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
      <StepHeader
        icon={BarChart3}
        title="Quel est ton niveau ?"
        subtitle={
          isPadel
            ? "Selectionne ton niveau de padel"
            : "Selectionne ton classement tennis"
        }
      />

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
            entering={FadeInDown.delay(200 + index * 100).duration(400)}
            style={styles.gridItem}
          >
            <Pressable
              onPress={() => onSelect(level.value)}
              style={[styles.padelTile, isSelected && styles.padelTileSelected]}
            >
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
            style={[styles.tennisRow, isSelected && styles.tennisRowSelected]}
          >
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
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.gray100,
    position: "relative",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  padelTileSelected: {
    borderColor: colors.accentGreen,
    backgroundColor: `${colors.accentGreen}08`,
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
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  tennisRowSelected: {
    borderColor: colors.accentGreen,
    backgroundColor: `${colors.accentGreen}08`,
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
