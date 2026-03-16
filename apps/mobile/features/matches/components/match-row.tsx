import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { PlayerView } from "@/components/ui/player-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import {
  formatMatchDuration,
  getHomeParticipant,
  getAwayParticipant,
  getStructuredMatchScore,
} from "@/lib/format";
import { SetScoresView } from "@/components/ui/set-scores-view";
import type { MatchWithParticipants } from "@/types/match";

interface MatchRowProps {
  match: MatchWithParticipants;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  scheduled: { label: "Planifi\u00e9", variant: "warning" },
  pending: { label: "En attente", variant: "warning" },
  ongoing: { label: "En cours", variant: "warning" },
  finished: { label: "Termin\u00e9", variant: "success" },
  cancelled: { label: "Annul\u00e9", variant: "danger" },
};

function getStatusBadge(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, variant: "warning" as const };
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function MatchRow({ match, onPress }: MatchRowProps) {
  const scheme = useColorScheme();

  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);
  const structuredScore = getStructuredMatchScore(match);
  const duration = formatMatchDuration(match);
  const statusBadge = getStatusBadge(match.status);
  const displayTime = formatTime(match.scheduledAt ?? match.startedAt ?? match.createdAt);
  const isOngoing = match.status === "ongoing";

  return (
    <Card
      onPress={onPress}
      style={isOngoing ? {
        borderColor: `${colors.accentOrange}4D`,
        borderWidth: 2,
      } : undefined}
    >
      {/* Header: time + status badge + duration */}
      <View style={styles.headerRow}>
        <View style={styles.timeRow}>
          <Clock size={14} color={colors.accentGreen} strokeWidth={2} />
          <Text style={[styles.timeText, { color: semanticColors.labelSecondary[scheme] }]}>
            {displayTime}
          </Text>
          {duration && (
            <>
              <Text style={[styles.dotSep, { color: semanticColors.labelTertiary[scheme] }]}>·</Text>
              <Text style={[styles.durationText, { color: semanticColors.labelSecondary[scheme] }]}>
                {duration}
              </Text>
            </>
          )}
        </View>
        <BadgePill label={statusBadge.label} variant={statusBadge.variant} />
      </View>

      {/* Set-by-set scores */}
      {structuredScore ? (
        <SetScoresView
          score={structuredScore}
          homeName={home?.user?.name ?? "N/A"}
          awayName={away?.user?.name ?? "N/A"}
          homeIsWinner={home?.isWinner}
          size="compact"
        />
      ) : (
        <View style={styles.playersSection}>
          <PlayerView
            name={home?.user?.name ?? "N/A"}
            imageUrl={home?.user?.image}
            isWinner={home?.isWinner ?? false}
          />
          <Text style={[styles.vsText, { color: semanticColors.labelSecondary[scheme] }]}>vs</Text>
          <PlayerView
            name={away?.user?.name ?? "N/A"}
            imageUrl={away?.user?.image}
            isWinner={away?.isWinner ?? false}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 15,
  },
  dotSep: {
    fontSize: 13,
  },
  durationText: {
    fontSize: 13,
  },
  playersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vsText: {
    fontSize: 15,
  },
});
