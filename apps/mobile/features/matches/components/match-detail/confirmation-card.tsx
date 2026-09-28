import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CircleAlert, Clock } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { useConfirmMatch } from "@/hooks/use-match";
import type { MatchDetail } from "@/types/match";

interface ConfirmationCardProps {
  matchDetail: MatchDetail;
  currentUserId: string;
}

/** A cross-club match only enters either club's feed once every participant has confirmed.
 * Shown to the current participant when their own confirmation is still due, or as a status line
 * when someone else's is. Never shown once nothing is pending — most matches never need it. */
export function ConfirmationCard({ matchDetail, currentUserId }: ConfirmationCardProps) {
  const scheme = useColorScheme();
  const confirmMatch = useConfirmMatch();

  const myParticipant = useMemo(
    () => matchDetail.participants.find((p) => p.userId === currentUserId),
    [matchDetail.participants, currentUserId],
  );

  const pendingOthers = useMemo(
    () =>
      matchDetail.participants.filter(
        (p) => p.userId !== currentUserId && !p.confirmedAt && !p.confirmationExpired,
      ),
    [matchDetail.participants, currentUserId],
  );

  const needsMyConfirmation =
    !!myParticipant && !myParticipant.confirmedAt && !myParticipant.confirmationExpired;

  if (!needsMyConfirmation && pendingOthers.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Clock size={20} color={colors.accentOrange} strokeWidth={2} />
        <View style={styles.textColumn}>
          {needsMyConfirmation ? (
            <>
              <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
                Confirmez ce match
              </Text>
              <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
                Il n&apos;apparaîtra dans le fil de votre club qu&apos;une fois confirmé.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
                En attente de confirmation
              </Text>
              <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
                {pendingOthers.length === 1
                  ? `${pendingOthers[0].user?.name ?? "Un joueur"} doit encore confirmer ce match.`
                  : "D'autres joueurs doivent encore confirmer ce match."}
              </Text>
            </>
          )}
        </View>
      </View>

      {needsMyConfirmation && (
        <Button
          label={confirmMatch.isPending ? "Confirmation..." : "Confirmer"}
          onPress={() => confirmMatch.mutate(matchDetail.match.id)}
          disabled={confirmMatch.isPending}
        />
      )}

      {confirmMatch.isError && (
        <View style={styles.errorRow}>
          <CircleAlert size={16} color={colors.red500} strokeWidth={2} />
          <Text style={[styles.errorText, { color: colors.red500 }]}>
            Le délai de confirmation de 7 jours est dépassé.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.card,
    gap: 12,
    borderRadius: radii.lg,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 13,
  },
});
