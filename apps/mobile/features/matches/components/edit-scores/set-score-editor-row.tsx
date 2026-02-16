import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { XCircle, ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { ScoreStepper } from "./score-stepper";

export interface EditableSet {
  key: string;
  setNumber: number;
  homeScore: number;
  awayScore: number;
}

interface SetScoreEditorRowProps {
  set: EditableSet;
  homeName: string;
  awayName: string;
  canDelete: boolean;
  onHomeScoreChange: (value: number) => void;
  onAwayScoreChange: (value: number) => void;
  onDelete: () => void;
}

export function SetScoreEditorRow({
  set,
  homeName,
  awayName,
  canDelete,
  onHomeScoreChange,
  onAwayScoreChange,
  onDelete,
}: SetScoreEditorRowProps) {
  const scheme = useColorScheme();
  const homeLeading = set.homeScore > set.awayScore;
  const awayLeading = set.awayScore > set.homeScore;

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(16).stiffness(140)}
      style={[styles.container, {
        backgroundColor: semanticColors.cardBackground[scheme],
        borderColor: semanticColors.borderColor[scheme],
      }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.setTitle, { color: semanticColors.labelPrimary[scheme] }]}>
          Set {set.setNumber}
        </Text>
        {canDelete && (
          <Pressable onPress={onDelete} hitSlop={8}>
            <XCircle size={22} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
          </Pressable>
        )}
      </View>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Home player */}
        <View style={styles.playerColumn}>
          <View style={styles.nameRow}>
            {homeLeading && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                <ChevronRight size={10} color="#007AFF" strokeWidth={3} />
              </Animated.View>
            )}
            <Text
              style={[styles.playerName, {
                color: homeLeading
                  ? semanticColors.labelPrimary[scheme]
                  : semanticColors.labelSecondary[scheme],
                fontWeight: homeLeading ? "700" : "500",
              }]}
              numberOfLines={1}
            >
              {homeName}
            </Text>
          </View>
          <ScoreStepper
            value={set.homeScore}
            onValueChange={onHomeScoreChange}
            accentColor="#007AFF"
          />
        </View>

        {/* VS */}
        <View style={styles.vsSeparator}>
          <Text style={[styles.vsText, { color: semanticColors.labelTertiary[scheme] }]}>VS</Text>
        </View>

        {/* Away player */}
        <View style={styles.playerColumn}>
          <View style={styles.nameRow}>
            {awayLeading && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                <ChevronRight size={10} color={colors.accentOrange} strokeWidth={3} />
              </Animated.View>
            )}
            <Text
              style={[styles.playerName, {
                color: awayLeading
                  ? semanticColors.labelPrimary[scheme]
                  : semanticColors.labelSecondary[scheme],
                fontWeight: awayLeading ? "700" : "500",
              }]}
              numberOfLines={1}
            >
              {awayName}
            </Text>
          </View>
          <ScoreStepper
            value={set.awayScore}
            onValueChange={onAwayScoreChange}
            accentColor={colors.accentOrange}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreboard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  playerColumn: {
    flex: 1,
    alignItems: "center",
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playerName: {
    fontSize: 12,
  },
  vsSeparator: {
    width: 32,
    alignItems: "center",
    paddingTop: 36,
  },
  vsText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
