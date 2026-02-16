import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, radii, semanticColors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import type { MatchRequestWithDetails } from "@/types/match-intent";

interface MatchRequestRowProps {
  item: MatchRequestWithDetails;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

function formatRequestDate(dateStr?: string | null): string {
  if (!dateStr) return "Date a definir";
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(date);
}

export function MatchRequestRow({ item, onAccept, onReject }: MatchRequestRowProps) {
  const scheme = useColorScheme();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const isProcessing = isAccepting || isRejecting;

  const requesterName = item.requester?.name ?? "Joueur inconnu";
  const dateDescription = formatRequestDate(item.matchIntent?.scheduledDate);

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.requesterInfo}>
          <Avatar
            imageUrl={item.requester?.image}
            name={requesterName}
            size={40}
          />
          <View style={styles.textContainer}>
            <Text
              style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
              numberOfLines={1}
            >
              {requesterName}
            </Text>
            <Text
              style={[styles.date, { color: semanticColors.labelSecondary[scheme] }]}
              numberOfLines={1}
            >
              {dateDescription}
            </Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Demande</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.rejectButton]}
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
          style={[styles.button, styles.acceptButton, isProcessing && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={isProcessing}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, styles.acceptText]}>Accepter</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requesterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${colors.accentGreen}26`,
    borderRadius: radii.xl,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.accentGreen,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
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
    color: colors.white,
  },
});
