import { View, Text, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import {
  formatMatchScore,
  formatMatchDuration,
  getHomeParticipant,
  getAwayParticipant,
  matchDetailToMatchWithParticipants,
} from "@/lib/format";
import type { MatchDetail, MatchParticipant, ParticipantOrganization } from "@/types/match";

interface ScoreCardProps {
  matchDetail: MatchDetail;
  currentUserId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "PLANIFIE", color: "#007AFF" },
  in_progress: { label: "EN COURS", color: "#FF3B30" },
  finished: { label: "TERMINE", color: "#34C759" },
};

function getOrgName(
  userId: string,
  participantOrgs: ParticipantOrganization[] | null | undefined
): string | undefined {
  return participantOrgs?.find((po) => po.userId === userId)?.organization.name;
}

function formatContextDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatContextTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function ScoreCard({ matchDetail, currentUserId }: ScoreCardProps) {
  const scheme = useColorScheme();
  const match = matchDetailToMatchWithParticipants(matchDetail);
  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);
  const score = formatMatchScore(match);
  const duration = formatMatchDuration(match);
  const status = matchDetail.match.status;
  const statusConfig = STATUS_CONFIG[status] ?? { label: status.toUpperCase(), color: "#8E8E93" };
  const hasSets = matchDetail.sets.length > 0;
  const isFinished = status === "finished";
  const hasWinner = matchDetail.participants.some((p) => p.isWinner);

  return (
    <View style={[styles.container, {
      backgroundColor: semanticColors.cardBackground[scheme],
      borderColor: semanticColors.borderColor[scheme],
    }]}>
      {/* Status pill */}
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: `${statusConfig.color}1A` }]}>
          {status === "in_progress" && (
            <View style={[styles.liveDot, { backgroundColor: statusConfig.color }]} />
          )}
          <Text style={[styles.pillText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Players + Score */}
      <View style={styles.playersRow}>
        <PlayerColumn
          participant={home}
          clubName={getOrgName(home?.userId ?? "", matchDetail.participantOrganizations)}
          isWinner={home?.isWinner ?? false}
          isLoser={isFinished && !home?.isWinner && hasWinner}
          scheme={scheme}
        />

        <View style={styles.scoreCenter}>
          {status === "scheduled" && !hasSets ? (
            <Text style={[styles.vsText, { color: semanticColors.labelTertiary[scheme] }]}>VS</Text>
          ) : (
            <Text style={[styles.scoreText, { color: semanticColors.labelPrimary[scheme] }]}>
              {score}
            </Text>
          )}
          {hasSets && (
            <Text style={[styles.setsLabel, { color: semanticColors.labelTertiary[scheme] }]}>
              SETS
            </Text>
          )}
        </View>

        <PlayerColumn
          participant={away}
          clubName={getOrgName(away?.userId ?? "", matchDetail.participantOrganizations)}
          isWinner={away?.isWinner ?? false}
          isLoser={isFinished && !away?.isWinner && hasWinner}
          scheme={scheme}
        />
      </View>

      {/* Divider + Context line */}
      <View style={styles.contextSection}>
        <View style={[styles.divider, { backgroundColor: semanticColors.borderColor[scheme] }]} />
        <ContextLine matchDetail={matchDetail} duration={duration} scheme={scheme} />
      </View>
    </View>
  );
}

function PlayerColumn({
  participant,
  clubName,
  isWinner,
  isLoser,
  scheme,
}: {
  participant: MatchParticipant | undefined;
  clubName: string | undefined;
  isWinner: boolean;
  isLoser: boolean;
  scheme: "light" | "dark";
}) {
  const name = participant?.user?.name ?? "Joueur";

  return (
    <View style={[styles.playerColumn, { opacity: isLoser ? 0.6 : 1.0 }]}>
      <View style={styles.avatarWrapper}>
        <Avatar imageUrl={participant?.user?.image} name={name} size={64} />
        {isWinner && (
          <View style={styles.crownWrapper}>
            <Crown size={16} color="#FFD700" fill="#FFD700" />
          </View>
        )}
      </View>
      <Text
        style={[styles.playerName, { color: semanticColors.labelPrimary[scheme] }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      {clubName && (
        <Text
          style={[styles.clubName, { color: semanticColors.labelTertiary[scheme] }]}
          numberOfLines={1}
        >
          {clubName}
        </Text>
      )}
    </View>
  );
}

function ContextLine({
  matchDetail,
  duration,
  scheme,
}: {
  matchDetail: MatchDetail;
  duration: string | null;
  scheme: "light" | "dark";
}) {
  const { match } = matchDetail;
  const color = semanticColors.labelTertiary[scheme];

  if (match.status === "scheduled" && match.scheduledAt) {
    return <Text style={[styles.contextText, { color }]}>{formatContextDate(match.scheduledAt)}</Text>;
  }

  if (match.status === "in_progress" && match.startedAt) {
    return (
      <Text style={[styles.contextText, { color }]}>
        Depuis {formatContextTime(match.startedAt)}
      </Text>
    );
  }

  if (match.status === "finished") {
    if (duration) {
      return <Text style={[styles.contextText, { color }]}>{duration}</Text>;
    }
    if (match.finishedAt) {
      return <Text style={[styles.contextText, { color }]}>{formatContextDate(match.finishedAt)}</Text>;
    }
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    paddingVertical: spacing.card + 8,
    borderRadius: radii.lg,
    borderWidth: 0.5,
  },
  pillRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.xl,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  playersRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  playerColumn: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  crownWrapper: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    left: "50%",
    marginLeft: -8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  clubName: {
    fontSize: 10,
  },
  scoreCenter: {
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  vsText: {
    fontSize: 40,
    fontWeight: "800",
    opacity: 0.5,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  setsLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  contextSection: {
    marginTop: 20,
    gap: 10,
  },
  divider: {
    height: 0.5,
  },
  contextText: {
    fontSize: 13,
    textAlign: "center",
  },
});
