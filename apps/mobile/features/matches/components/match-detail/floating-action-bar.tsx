import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Play,
  Pencil,
  Check,
  MessageSquare,
  Trash2,
} from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchDetail } from "@/types/match";

interface SheetActionBarProps {
  matchDetail: MatchDetail;
  currentUserId: string;
  isParticipant: boolean;
  onStart: () => void;
  onEditScores: () => void;
  onFinish: () => void;
  onEditMatch: () => void;
  onComment: () => void;
  onDelete: () => void;
}

export function SheetActionBar({
  matchDetail,
  currentUserId,
  isParticipant,
  onStart,
  onEditScores,
  onFinish,
  onEditMatch,
  onComment,
  onDelete,
}: SheetActionBarProps) {
  const scheme = useColorScheme();

  if (!isParticipant) return null;

  const status = matchDetail.match.status;
  const isScheduled = status === "scheduled";
  const isOngoing = status === "in_progress";
  const isFinished = status === "finished";
  const hasUserCommented = (matchDetail.comments ?? []).some(
    (c) => c.userId === currentUserId
  );

  return (
    <View style={styles.container
    }>
      <View style={styles.buttonsRow}>
        {isScheduled && (
          <ActionButton
            icon={<Play size={16} color={colors.accentGreen} strokeWidth={2.5} />}
            label="Démarrer"
            color={colors.accentGreen}
            onPress={onStart}
            scheme={scheme}
          />
        )}

        {isOngoing && (
          <ActionButton
            icon={<Pencil size={16} color={colors.accentGreen} strokeWidth={2.5} />}
            label="Scores"
            color={colors.accentGreen}
            onPress={onEditScores}
            scheme={scheme}
          />
        )}

        {isOngoing && (
          <ActionButton
            icon={<Check size={16} color={colors.accentOrange} strokeWidth={2.5} />}
            label="Terminer"
            color={colors.accentOrange}
            onPress={onFinish}
            scheme={scheme}
          />
        )}

        {isFinished && (
          <ActionButton
            icon={<Pencil size={16} color={colors.accentOrange} strokeWidth={2.5} />}
            label="Modifier"
            color={colors.accentOrange}
            onPress={onEditMatch}
            scheme={scheme}
          />
        )}

        {isFinished && !hasUserCommented && (
          <ActionButton
            icon={<MessageSquare size={16} color={colors.accentGreen} strokeWidth={2.5} />}
            label="Commenter"
            color={colors.accentGreen}
            onPress={onComment}
            scheme={scheme}
          />
        )}

        <Pressable
          onPress={onDelete}
          style={[styles.moreButton, {
            backgroundColor: scheme === "light" ? "#F2F2F7" : "#2C2C2E",
          }]}
        >
          <Trash2 size={18} color="#FF3B30" strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
  scheme,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
  scheme: "light" | "dark";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, {
        backgroundColor: scheme === "light" ? "#F2F2F7" : "#2C2C2E",
      }]}
    >
      {icon}
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.xl,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
