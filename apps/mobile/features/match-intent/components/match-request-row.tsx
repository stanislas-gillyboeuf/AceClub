import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { GlassView } from "@/components/ui/glass-view";
import { Avatar } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Timer,
  Trophy,
  Dumbbell,
  Building2,
} from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, radii, semanticColors, spacing } from "@/constants/theme";
import { formatFullDate, formatTime, formatDuration } from "@/lib/format";
import { formatSkillLevel } from "@/lib/skill-levels";
import type { MatchRequestWithDetails } from "@/types/match-intent";

interface MatchRequestRowProps {
  item: MatchRequestWithDetails;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function MatchRequestRow({ item, onAccept, onReject }: MatchRequestRowProps) {
  const scheme = useColorScheme();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const isProcessing = isAccepting || isRejecting;

  const requesterName = item.requester?.name ?? "Joueur inconnu";
  const ranking = formatSkillLevel(item.requester?.skillLevel, item.requester?.sport);

  const intent = item.matchIntent;
  const intentType = intent?.type ?? "match";
  const typeLabel = intentType === "match" ? "Match" : "Entraînement";
  const TypeIcon = intentType === "match" ? Trophy : Dumbbell;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject();
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <GlassView style={styles.container}>
      {/* Requester info */}
      <View style={styles.header}>
        <Avatar
          imageUrl={item.requester?.image}
          name={requesterName}
          size={44}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {requesterName}
          </Text>
          <View style={styles.metaRow}>
            {ranking && (
              <>
                <Trophy size={12} color={colors.accentGreen} strokeWidth={2} />
                <Text style={[styles.metaText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {ranking}
                </Text>
              </>
            )}
            {item.requester?.organization && (
              <>
                {ranking && (
                  <Text style={[styles.metaDot, { color: semanticColors.labelTertiary[scheme] }]}>·</Text>
                )}
                <Building2 size={12} color={colors.accentGreen} strokeWidth={2} />
                <Text
                  style={[styles.metaText, { color: semanticColors.labelSecondary[scheme] }]}
                  numberOfLines={1}
                >
                  {item.requester.organization.name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Intent details */}
      {intent && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <TypeIcon size={14} color={colors.accentGreen} strokeWidth={2} />
            <Text style={[styles.detailText, { color: semanticColors.labelPrimary[scheme] }]}>
              {typeLabel}
            </Text>
          </View>
          {intent.date && (
            <View style={styles.detailRow}>
              <Calendar size={14} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.detailText, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatFullDate(intent.date)}
              </Text>
            </View>
          )}
          {intent.time && (
            <View style={styles.detailRow}>
              <Clock size={14} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.detailText, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatTime(intent.time)}
              </Text>
            </View>
          )}
          {intent.duration != null && intent.duration > 0 && (
            <View style={styles.detailRow}>
              <Timer size={14} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.detailText, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatDuration(intent.duration)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.rejectButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleReject}
          disabled={isProcessing}
        >
          {isRejecting ? (
            <ActivityIndicator size="small" color={colors.red500} />
          ) : (
            <Text style={[styles.buttonText, styles.rejectText]}>Refuser</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.acceptButton,
            isProcessing && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleAccept}
          disabled={isProcessing}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, styles.acceptText]}>Accepter</Text>
          )}
        </Pressable>
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  metaDot: {
    fontSize: 13,
  },
  details: {
    gap: 6,
    paddingLeft: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  rejectButton: {
    backgroundColor: `${colors.red500}15`,
  },
  acceptButton: {
    backgroundColor: colors.accentGreen,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  rejectText: {
    color: colors.red500,
  },
  acceptText: {
    color: "#FFFFFF",
  },
});
