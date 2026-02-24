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
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useMatch,
  useCreateFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
} from "@/hooks/use-match";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { SensationPicker } from "@/features/matches/components/feedback/sensation-picker";
import { VisibilityToggle } from "@/features/matches/components/feedback/visibility-toggle";

const MAX_COMMENT_LENGTH = 500;

export default function FeedbackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();

  const { data: matchDetail } = useMatch(id);
  const createFeedback = useCreateFeedback();
  const updateFeedback = useUpdateFeedback();
  const deleteFeedback = useDeleteFeedback();

  const existingFeedback = matchDetail?.myFeedback;
  const isEditing = !!existingFeedback;

  const [selectedSensation, setSelectedSensation] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [visibleToClub, setVisibleToClub] = useState(true);

  useEffect(() => {
    if (existingFeedback) {
      setSelectedSensation(existingFeedback.sensation);
      setComment(existingFeedback.comment ?? "");
      setVisibleToClub(existingFeedback.visibleToClub);
    }
  }, [existingFeedback?.id]);

  const isSaving =
    createFeedback.isPending || updateFeedback.isPending || deleteFeedback.isPending;
  const canSubmit =
    selectedSensation !== null && comment.length <= MAX_COMMENT_LENGTH && !isSaving;

  const handleSubmit = () => {
    if (!canSubmit || !matchDetail) return;

    const trimmedComment = comment.trim();
    const matchId = matchDetail.match.id;

    if (isEditing) {
      updateFeedback.mutate(
        {
          matchId,
          data: {
            sensation: selectedSensation,
            comment: trimmedComment || null,
            visibleToClub,
          },
        },
        {
          onSuccess: () => router.dismiss(),
          onError: (err) =>
            Alert.alert("Erreur", err.message ?? "Impossible de modifier les sensations."),
        },
      );
    } else {
      createFeedback.mutate(
        {
          matchId,
          data: {
            sensation: selectedSensation!,
            comment: trimmedComment || undefined,
            visibleToClub,
          },
        },
        {
          onSuccess: () => router.dismiss(),
          onError: (err) =>
            Alert.alert("Erreur", err.message ?? "Impossible d'enregistrer les sensations."),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!matchDetail) return;
    Alert.alert("Supprimer le feedback", "Es-tu sûr de vouloir supprimer tes sensations ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteFeedback.mutate(matchDetail.match.id, {
            onSuccess: () => router.dismiss(),
            onError: (err) =>
              Alert.alert("Erreur", err.message ?? "Impossible de supprimer les sensations."),
          });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "Modifier tes sensations" : "Comment tu te sens ?",
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
          <SensationPicker
            selected={selectedSensation}
            onSelect={setSelectedSensation}
          />

          <GlassView style={styles.commentCard}>
            <TextInput
              style={[styles.input, { color: semanticColors.labelPrimary[scheme] }]}
              placeholder="Un commentaire ? (optionnel)"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              value={comment}
              onChangeText={setComment}
              maxLength={MAX_COMMENT_LENGTH}
              multiline
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.charCount,
                {
                  color:
                    comment.length > MAX_COMMENT_LENGTH
                      ? "#FF3B30"
                      : semanticColors.labelTertiary[scheme],
                },
              ]}
            >
              {comment.length}/{MAX_COMMENT_LENGTH}
            </Text>
          </GlassView>

          <VisibilityToggle value={visibleToClub} onValueChange={setVisibleToClub} />

          {isEditing && (
            <Pressable onPress={handleDelete} disabled={isSaving} style={styles.deleteButton}>
              <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
              <Text style={styles.deleteText}>Supprimer le feedback</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {isSaving && (
        <View style={styles.overlay}>
          <GlassView style={styles.overlayCard}>
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text
              style={[styles.overlayText, { color: semanticColors.labelSecondary[scheme] }]}
            >
              {deleteFeedback.isPending ? "Suppression..." : "Enregistrement..."}
            </Text>
          </GlassView>
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
    gap: 16,
  },
  commentCard: {
    borderRadius: radii.md,
    padding: 16,
    gap: 6,
  },
  input: {
    fontSize: 16,
    minHeight: 80,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
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
