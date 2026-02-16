import { View, Text, Pressable, StyleSheet } from "react-native";
import { MessageSquarePlus, MessageCircle } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchDetail, MatchComment } from "@/types/match";

interface CommentsCardProps {
  matchDetail: MatchDetail;
  currentUserId: string;
  isParticipant: boolean;
  onAddComment: () => void;
  onEditComment: () => void;
}

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentsCard({
  matchDetail,
  currentUserId,
  isParticipant,
  onAddComment,
  onEditComment,
}: CommentsCardProps) {
  const scheme = useColorScheme();
  const comments = [...(matchDetail.comments ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const hasUserCommented = comments.some((c) => c.userId === currentUserId);

  return (
    <View style={[styles.container, {
      backgroundColor: semanticColors.cardBackground[scheme],
      borderColor: semanticColors.borderColor[scheme],
    }]}>
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        COMMENTAIRES
      </Text>

      {comments.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={28} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
          <Text style={[styles.emptyText, { color: semanticColors.labelTertiary[scheme] }]}>
            Aucun commentaire
          </Text>
        </View>
      ) : (
        <View>
          {comments.map((comment, index) => (
            <View key={comment.id}>
              {index > 0 && (
                <View style={[styles.divider, { backgroundColor: semanticColors.borderColor[scheme] }]} />
              )}
              <CommentRow
                comment={comment}
                currentUserId={currentUserId}
                onEditComment={onEditComment}
                scheme={scheme}
              />
            </View>
          ))}
        </View>
      )}

      {!hasUserCommented && isParticipant && (
        <Pressable onPress={onAddComment} style={styles.addButton}>
          <MessageSquarePlus size={14} color={colors.accentGreen} strokeWidth={2} />
          <Text style={[styles.addButtonText, { color: colors.accentGreen }]}>
            Ajouter un commentaire
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onEditComment,
  scheme,
}: {
  comment: MatchComment;
  currentUserId: string;
  onEditComment: () => void;
  scheme: "light" | "dark";
}) {
  const wasEdited = comment.updatedAt !== comment.createdAt;
  const isOwn = comment.userId === currentUserId;

  return (
    <Pressable
      onPress={isOwn ? onEditComment : undefined}
      style={styles.commentRow}
    >
      <Avatar
        imageUrl={comment.user?.image}
        name={comment.user?.name ?? "?"}
        size={32}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentNameRow}>
            <Text style={[styles.commentAuthor, { color: semanticColors.labelPrimary[scheme] }]}>
              {comment.user?.name ?? "Inconnu"}
            </Text>
            {wasEdited && (
              <Text style={[styles.editedLabel, { color: semanticColors.labelTertiary[scheme] }]}>
                (modifié)
              </Text>
            )}
          </View>
          <Text style={[styles.commentDate, { color: semanticColors.labelTertiary[scheme] }]}>
            {formatCommentDate(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: semanticColors.labelPrimary[scheme] }]}>
          {comment.content}
        </Text>
      </View>
    </Pressable>
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
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  divider: {
    height: 0.5,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "500",
  },
  editedLabel: {
    fontSize: 10,
  },
  commentDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
