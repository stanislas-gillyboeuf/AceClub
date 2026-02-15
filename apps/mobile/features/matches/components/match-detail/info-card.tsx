import { View, Text, StyleSheet } from "react-native";
import {
  Trophy,
  Dumbbell,
  Calendar,
  Play,
  CheckCircle,
  Timer,
} from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { formatMatchDuration, matchDetailToMatchWithParticipants } from "@/lib/format";
import type { MatchDetail } from "@/types/match";
import type { LucideIcon } from "lucide-react-native";

interface InfoCardProps {
  matchDetail: MatchDetail;
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMatchTypeInfo(type: string | null | undefined): { label: string; icon: LucideIcon; color: string } {
  if (type === "doubles") {
    return { label: "Entraînement", icon: Dumbbell, color: colors.accentOrange };
  }
  return { label: "Match", icon: Trophy, color: "#007AFF" };
}

export function InfoCard({ matchDetail }: InfoCardProps) {
  const scheme = useColorScheme();
  const { match } = matchDetail;
  const matchAsWP = matchDetailToMatchWithParticipants(matchDetail);
  const duration = formatMatchDuration(matchAsWP);
  const typeInfo = getMatchTypeInfo(match.type);

  const rows: { icon: LucideIcon; label: string; value: string; valueColor?: string }[] = [];

  rows.push({
    icon: typeInfo.icon,
    label: "Type",
    value: typeInfo.label,
    valueColor: typeInfo.color,
  });

  if (match.scheduledAt) {
    rows.push({ icon: Calendar, label: "Date prévue", value: formatDateFull(match.scheduledAt) });
  }

  if (match.startedAt) {
    rows.push({ icon: Play, label: "Démarré le", value: formatDateFull(match.startedAt) });
  }

  if (match.finishedAt) {
    rows.push({ icon: CheckCircle, label: "Terminé le", value: formatDateFull(match.finishedAt) });
  }

  if (duration) {
    rows.push({ icon: Timer, label: "Durée", value: duration });
  }

  return (
    <View style={[styles.container, {
      backgroundColor: semanticColors.cardBackground[scheme],
      borderColor: semanticColors.borderColor[scheme],
    }]}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        INFORMATIONS
      </Text>

      <View style={styles.rows}>
        {rows.map((row, index) => {
          const IconComp = row.icon;
          return (
            <View key={row.label}>
              {index > 0 && (
                <View style={[styles.divider, { backgroundColor: semanticColors.borderColor[scheme] }]} />
              )}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <IconComp size={14} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
                  <Text style={[styles.rowLabel, { color: semanticColors.labelSecondary[scheme] }]}>
                    {row.label}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rowValue,
                    {
                      color: row.valueColor ?? semanticColors.labelPrimary[scheme],
                      fontWeight: row.label === "Durée" ? "600" : "400",
                    },
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  rows: {},
  divider: {
    height: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
  },
});
