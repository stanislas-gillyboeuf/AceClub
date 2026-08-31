import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSkillLevels } from "@/lib/skill-levels";

interface DiscoverFiltersProps {
  sport: "tennis" | "padel";
  onSportChange: (sport: "tennis" | "padel") => void;
  selectedLevels: string[];
  onToggleLevel: (level: string) => void;
}

const SPORTS: { key: "tennis" | "padel"; label: string }[] = [
  { key: "tennis", label: "Tennis" },
  { key: "padel", label: "Padel" },
];

export function DiscoverFilters({
  sport,
  onSportChange,
  selectedLevels,
  onToggleLevel,
}: DiscoverFiltersProps) {
  const scheme = useColorScheme();
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const accent = sport === "padel" ? colors.accentOrange : colors.accentGreen;
  const levels = getSkillLevels(sport);

  const levelButtonLabel =
    selectedLevels.length === 0
      ? "Tous niveaux"
      : selectedLevels.length === 1
        ? levels.find((l) => l.value === selectedLevels[0])?.displayName ?? "1 niveau"
        : `${selectedLevels.length} niveaux`;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.sportTrack,
          {
            backgroundColor: semanticColors.systemGray6[scheme],
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        {SPORTS.map((option) => {
          const active = option.key === sport;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSportChange(option.key)}
              style={[styles.sportButton, active && { backgroundColor: accent }]}
            >
              <Text
                style={[
                  styles.sportLabel,
                  { color: active ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.levelRow}>
        <Pressable
          onPress={() => setShowLevelMenu(true)}
          style={[
            styles.levelButton,
            {
              backgroundColor: semanticColors.systemGray6[scheme],
              borderColor: selectedLevels.length > 0 ? accent : semanticColors.borderColor[scheme],
            },
          ]}
        >
          <Text
            style={[
              styles.levelButtonText,
              { color: selectedLevels.length > 0 ? accent : semanticColors.labelPrimary[scheme] },
            ]}
          >
            {levelButtonLabel}
          </Text>
          <ChevronDown
            size={16}
            color={selectedLevels.length > 0 ? accent : semanticColors.labelSecondary[scheme]}
            strokeWidth={2.5}
          />
        </Pressable>
      </View>

      <Modal
        visible={showLevelMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLevelMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowLevelMenu(false)}>
          <GlassView style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Niveau
              </Text>
              {selectedLevels.length > 0 && (
                <Pressable onPress={() => selectedLevels.forEach(onToggleLevel)}>
                  <Text style={[styles.menuClear, { color: accent }]}>Tout effacer</Text>
                </Pressable>
              )}
            </View>
            <ScrollView style={styles.menuScroll}>
              {levels.map((level) => {
                const active = selectedLevels.includes(level.value);
                return (
                  <Pressable
                    key={level.value}
                    style={[styles.menuItem, { borderBottomColor: semanticColors.borderColor[scheme] }]}
                    onPress={() => onToggleLevel(level.value)}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        { color: active ? accent : semanticColors.labelPrimary[scheme] },
                      ]}
                    >
                      {level.displayName}
                    </Text>
                    {active && <Check size={18} color={accent} strokeWidth={2.5} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              onPress={() => setShowLevelMenu(false)}
              style={[styles.menuDoneButton, { backgroundColor: accent }]}
            >
              <Text style={styles.menuDoneText}>Terminé</Text>
            </Pressable>
          </GlassView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sportTrack: {
    flexDirection: "row",
    marginHorizontal: spacing.horizontal,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 3,
  },
  sportButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: radii.md - 3,
  },
  sportLabel: {
    fontWeight: "700",
    fontSize: 13.5,
  },
  levelRow: {
    paddingHorizontal: spacing.horizontal,
  },
  levelButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 11,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  levelButtonText: {
    fontWeight: "700",
    fontSize: 12.5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  menuContainer: {
    width: "100%",
    maxWidth: 320,
    maxHeight: "70%",
    borderRadius: 16,
    padding: 20,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  menuClear: {
    fontSize: 13,
    fontWeight: "600",
  },
  menuScroll: {
    flexGrow: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuDoneButton: {
    marginTop: 12,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  menuDoneText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
