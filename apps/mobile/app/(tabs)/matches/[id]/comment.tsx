import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { X, Check, Trash2 } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMatch, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/use-match";
import { useMe } from "@/hooks/use-user";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";

const MAX_LENGTH = 500;

export default function CommentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();

  const { data: matchDetail } = useMatch(id);
  const { data: me } = useMe();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const existingComment = (matchDetail?.comments ?? []).find(
    (c) => c.userId === me?.id
  );
  const isEditing = !!existingComment;

  const [content, setContent] = useState("");

  useEffect(() => {
    if (existingComment) {
      setContent(existingComment.content);
    }
  }, [existingComment?.content]);

  const isSaving = createComment.isPending || updateComment.isPending || deleteComment.isPending;
  const canSubmit = content.trim().length > 0 && content.trim().length <= MAX_LENGTH && !isSaving;

  const handleSubmit = () => {
    if (!canSubmit || !matchDetail) return;

    const data = { content: content.trim() };
    const matchId = matchDetail.match.id;

    if (isEditing) {
      updateComment.mutate(
        { matchId, data },
        {
          onSuccess: () => router.dismiss(),
          onError: (err) => Alert.alert("Erreur", err.message ?? "Impossible de modifier le commentaire."),
        }
      );
    } else {
      createComment.mutate(
        { matchId, data },
        {
          onSuccess: () => router.dismiss(),
          onError: (err) => Alert.alert("Erreur", err.message ?? "Impossible de publier le commentaire."),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!matchDetail) return;
    Alert.alert("Supprimer le commentaire", "Es-tu sûr de vouloir supprimer ton commentaire ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteComment.mutate(matchDetail.match.id, {
            onSuccess: () => router.dismiss(),
            onError: (err) => Alert.alert("Erreur", err.message ?? "Impossible de supprimer le commentaire."),
          });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "Modifier le commentaire" : "Ajouter un commentaire",
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()} disabled={isSaving} hitSlop={8}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSubmit} disabled={!canSubmit} hitSlop={8}>
              <Check
                size={24}
                color={canSubmit ? colors.accentGreen : colors.gray400}
                strokeWidth={2}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={[styles.root, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: semanticColors.cardBackground[scheme],
                borderColor: semanticColors.borderColor[scheme],
                color: semanticColors.labelPrimary[scheme],
              },
            ]}
            placeholder="Écris ton commentaire..."
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            value={content}
            onChangeText={setContent}
            maxLength={MAX_LENGTH}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.footer}>
            <Text style={[styles.charCount, {
              color: content.length > MAX_LENGTH ? "#FF3B30" : semanticColors.labelTertiary[scheme],
            }]}>
              {content.length}/{MAX_LENGTH}
            </Text>

            {isEditing && (
              <Pressable onPress={handleDelete} disabled={isSaving} style={styles.deleteButton}>
                <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
                <Text style={styles.deleteText}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {isSaving && (
        <View style={styles.overlay}>
          <View style={[styles.overlayCard, {
            backgroundColor: semanticColors.cardBackground[scheme],
          }]}>
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text style={[styles.overlayText, { color: semanticColors.labelSecondary[scheme] }]}>
              {deleteComment.isPending ? "Suppression..." : "Enregistrement..."}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.horizontal,
    gap: 12,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: radii.md,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 250,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF3B30",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: radii.md,
  },
  overlayText: {
    fontSize: 14,
  },
});
