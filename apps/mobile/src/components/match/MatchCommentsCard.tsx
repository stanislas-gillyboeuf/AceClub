import { useState } from "react";
import { View, Text, Pressable, TextInput } from "@/tw";
import { Alert } from "react-native";
import { MessageSquare, Send, Trash2 } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchComment } from "@/types/match";
import { useAuthStore } from "@/stores/auth";
import {
  useAddMatchComment,
  useUpdateMatchComment,
  useDeleteMatchComment,
} from "@/hooks/useMatch";

interface MatchCommentsCardProps {
  matchId: string;
  comments: MatchComment[];
  matchStatus: string;
}

export function MatchCommentsCard({
  matchId,
  comments,
  matchStatus,
}: MatchCommentsCardProps) {
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";
  const [commentText, setCommentText] = useState("");

  const addComment = useAddMatchComment();
  const updateComment = useUpdateMatchComment();
  const deleteComment = useDeleteMatchComment();

  const userComment = comments.find((c) => c.userId === currentUserId);
  const canComment = matchStatus === "finished" && !userComment;

  const handleSubmit = () => {
    const text = commentText.trim();
    if (!text) return;

    addComment.mutate(
      { matchId, content: text },
      { onSuccess: () => setCommentText("") }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le commentaire",
      "Voulez-vous vraiment supprimer votre commentaire ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteComment.mutate(matchId),
        },
      ]
    );
  };

  return (
    <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark gap-3">
      <View className="flex-row items-center gap-2">
        <MessageSquare size={16} color="#8E8E93" />
        <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide">
          Commentaires ({comments.length})
        </Text>
      </View>

      {/* Existing comments */}
      {comments.map((comment) => (
        <View key={comment.id} className="flex-row gap-2">
          <Avatar
            imageUrl={comment.user?.image}
            name={comment.user?.name ?? "?"}
            size={32}
          />
          <View className="flex-1">
            <Text className="text-sm text-label-primary dark:text-label-primary-dark">
              <Text className="font-sans-semibold">
                {comment.user?.name}{" "}
              </Text>
              <Text className="font-sans">{comment.content}</Text>
            </Text>
          </View>
          {comment.userId === currentUserId && (
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Trash2 size={14} color="#FF3B30" />
            </Pressable>
          )}
        </View>
      ))}

      {/* Empty state */}
      {comments.length === 0 && (
        <Text className="text-sm font-sans text-label-secondary text-center py-2">
          Aucun commentaire
        </Text>
      )}

      {/* Comment input */}
      {canComment && (
        <View className="flex-row items-center gap-2 pt-2 border-t border-border dark:border-border-dark">
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#8E8E93"
            className="flex-1 bg-bg-input dark:bg-bg-input-dark text-label-primary dark:text-label-primary-dark font-sans text-sm px-3 py-2.5 rounded-lg"
            maxLength={500}
            multiline
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!commentText.trim() || addComment.isPending}
            hitSlop={8}
          >
            <Send
              size={20}
              color={commentText.trim() ? "#34C759" : "#8E8E93"}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}
