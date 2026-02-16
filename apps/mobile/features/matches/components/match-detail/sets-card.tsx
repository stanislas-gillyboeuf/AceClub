import { View, Text, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchDetail, MatchSet } from "@/types/match";

interface SetsCardProps {
  matchDetail: MatchDetail;
}

function getHomeUserId(matchDetail: MatchDetail): string {
  return matchDetail.participants.find((p) => p.side === "home")?.userId ?? "";
}

function getAwayUserId(matchDetail: MatchDetail): string {
  return matchDetail.participants.find((p) => p.side === "away")?.userId ?? "";
}

function getHomeName(matchDetail: MatchDetail): string {
  return matchDetail.participants.find((p) => p.side === "home")?.user?.name ?? "Joueur 1";
}

function getAwayName(matchDetail: MatchDetail): string {
  return matchDetail.participants.find((p) => p.side === "away")?.user?.name ?? "Joueur 2";
}

function getScore(set: MatchSet, userId: string): number {
  return set.scores?.find((s) => s.userId === userId)?.games ?? 0;
}

export function SetsCard({ matchDetail }: SetsCardProps) {
  const scheme = useColorScheme();
  const sortedSets = [...matchDetail.sets].sort((a, b) => a.setNumber - b.setNumber);

  if (sortedSets.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        SCORES PAR SET
      </Text>

      {sortedSets.map((set) => (
        <SetCard key={set.id} set={set} matchDetail={matchDetail} scheme={scheme} />
      ))}
    </View>
  );
}

function SetCard({
  set,
  matchDetail,
  scheme,
}: {
  set: MatchSet;
  matchDetail: MatchDetail;
  scheme: "light" | "dark";
}) {
  const homeUserId = getHomeUserId(matchDetail);
  const awayUserId = getAwayUserId(matchDetail);
  const homeScore = getScore(set, homeUserId);
  const awayScore = getScore(set, awayUserId);
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;

  return (
    <View style={[styles.setCard, {
      backgroundColor: semanticColors.cardBackground[scheme],
      borderColor: semanticColors.borderColor[scheme],
    }]}>
      <Text style={[styles.setHeader, { color: semanticColors.labelPrimary[scheme] }]}>
        Set {set.setNumber}
      </Text>

      <View style={styles.scoreboard}>
        <PlayerScoreColumn
          name={getHomeName(matchDetail)}
          score={homeScore}
          isWinner={homeWins}
          accentColor="#007AFF"
          scheme={scheme}
        />

        <View style={styles.vsSeparator}>
          <Text style={[styles.vsText, { color: semanticColors.labelTertiary[scheme] }]}>VS</Text>
        </View>

        <PlayerScoreColumn
          name={getAwayName(matchDetail)}
          score={awayScore}
          isWinner={awayWins}
          accentColor={colors.accentOrange}
          scheme={scheme}
        />
      </View>
    </View>
  );
}

function PlayerScoreColumn({
  name,
  score,
  isWinner,
  accentColor,
  scheme,
}: {
  name: string;
  score: number;
  isWinner: boolean;
  accentColor: string;
  scheme: "light" | "dark";
}) {
  return (
    <View style={styles.playerScoreColumn}>
      <View style={styles.nameRow}>
        {isWinner && <ChevronRight size={10} color={accentColor} strokeWidth={3} />}
        <Text
          style={[
            styles.playerName,
            { color: isWinner ? semanticColors.labelPrimary[scheme] : semanticColors.labelSecondary[scheme] },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      <View style={[
        styles.scoreBox,
        { backgroundColor: scheme === "light" ? "#F2F2F7" : "#1C1C1E" },
        isWinner && { borderColor: `${accentColor}4D`, borderWidth: 1.5 },
      ]}>
        <Text style={[styles.scoreValue, { color: semanticColors.labelPrimary[scheme] }]}>
          {score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  setCard: {
    padding: spacing.card,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    gap: 16,
  },
  setHeader: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vsSeparator: {
    width: 32,
    alignItems: "center",
  },
  vsText: {
    fontSize: 10,
    fontWeight: "700",
  },
  playerScoreColumn: {
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
    fontWeight: "500",
  },
  scoreBox: {
    width: "100%",
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
