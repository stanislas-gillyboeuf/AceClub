import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { StructuredMatchScore } from "@/lib/format";

interface SetScoresViewProps {
  score: StructuredMatchScore;
  homeName: string;
  awayName: string;
  homeIsWinner?: boolean;
  size?: "compact" | "large";
}

export function SetScoresView({
  score,
  homeName,
  awayName,
  homeIsWinner,
  size = "compact",
}: SetScoresViewProps) {
  const scheme = useColorScheme();
  const isCompact = size === "compact";

  const fontSize = isCompact ? 15 : 22;
  const nameFontSize = isCompact ? 13 : 16;
  const dotSize = isCompact ? 6 : 8;
  const gap = isCompact ? 8 : 12;
  const nameMaxWidth = isCompact ? 100 : 140;

  const homeWon = homeIsWinner ?? score.homeSetsWon > score.awaySetsWon;
  const awayWon = !homeWon;

  return (
    <View style={[styles.container, { gap: isCompact ? 4 : 8 }]}>
      {/* Home player row */}
      <PlayerScoreRow
        name={homeName}
        sets={score.sets.map((s) => s.homeGames)}
        isWinner={homeWon}
        scheme={scheme}
        fontSize={fontSize}
        nameFontSize={nameFontSize}
        dotSize={dotSize}
        gap={gap}
        nameMaxWidth={nameMaxWidth}
      />

      {/* Separator */}
      <View
        style={[
          styles.separator,
          { backgroundColor: semanticColors.borderColor[scheme] },
        ]}
      />

      {/* Away player row */}
      <PlayerScoreRow
        name={awayName}
        sets={score.sets.map((s) => s.awayGames)}
        isWinner={awayWon}
        scheme={scheme}
        fontSize={fontSize}
        nameFontSize={nameFontSize}
        dotSize={dotSize}
        gap={gap}
        nameMaxWidth={nameMaxWidth}
      />
    </View>
  );
}

function PlayerScoreRow({
  name,
  sets,
  isWinner,
  scheme,
  fontSize,
  nameFontSize,
  dotSize,
  gap,
  nameMaxWidth,
}: {
  name: string;
  sets: number[];
  isWinner: boolean;
  scheme: "light" | "dark";
  fontSize: number;
  nameFontSize: number;
  dotSize: number;
  gap: number;
  nameMaxWidth: number;
}) {
  const winnerColor = colors.accentGreen;
  const loserColor = semanticColors.labelTertiary[scheme];
  const textColor = isWinner ? winnerColor : loserColor;

  return (
    <View style={styles.playerRow}>
      <View style={[styles.nameSection, { maxWidth: nameMaxWidth }]}>
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isWinner ? winnerColor : "transparent",
            },
          ]}
        />
        <Text
          style={[styles.playerName, { color: textColor, fontSize: nameFontSize }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      <View style={[styles.setsSection, { gap }]}>
        {sets.map((games, index) => (
          <Text
            key={index}
            style={[
              styles.setScore,
              {
                color: textColor,
                fontSize,
                fontWeight: isWinner ? "700" : "400",
              },
            ]}
          >
            {games}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dot: {},
  playerName: {
    fontWeight: "500",
  },
  setsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  setScore: {
    fontVariant: ["tabular-nums"],
    minWidth: 24,
    textAlign: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
