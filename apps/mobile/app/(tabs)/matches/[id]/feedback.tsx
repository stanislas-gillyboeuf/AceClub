import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { X, Check, Trash2 } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useMatch,
  useCreateFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
} from "@/hooks/use-match";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { EffortPicker } from "@/features/matches/components/feedback/effort-picker";

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

  const [selectedEffort, setSelectedEffort] = useState<string | null>(null);

  useEffect(() => {
    if (existingFeedback) {
      setSelectedEffort(existingFeedback.sensation);
    }
  }, [existingFeedback?.id]);

  const isSaving =
    createFeedback.isPending || updateFeedback.isPending || deleteFeedback.isPending;

  const canSubmit = !!selectedEffort && !isSaving;

  const handleDone = async () => {
    if (!selectedEffort || !matchDetail) return;
    const matchId = matchDetail.match.id;

    try {
      const feedbackData = {
        sensation: selectedEffort,
        comment: existingFeedback?.comment ?? undefined,
        visibleToClub: existingFeedback?.visibleToClub ?? true,
      };

      if (isEditing) {
        await updateFeedback.mutateAsync({ matchId, data: feedbackData });
      } else {
        await createFeedback.mutateAsync({ matchId, data: feedbackData });
      }

      router.dismiss();
    } catch (err: any) {
      Alert.alert("Erreur", err.message ?? "Impossible de sauvegarder.");
    }
  };

  const handleDelete = () => {
    if (!matchDetail) return;
    Alert.alert("Supprimer le feedback", "Es-tu sûr de vouloir supprimer ton effort ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteFeedback.mutate(matchDetail.match.id, {
            onSuccess: () => router.dismiss(),
            onError: (err) =>
              Alert.alert("Erreur", err.message ?? "Impossible de supprimer."),
          });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mon effort",
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()} disabled={isSaving} hitSlop={8}>
              <X size={24} color={colors.accentGreen} strokeWidth={2} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleDone} disabled={!canSubmit} hitSlop={8}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.accentGreen} />
              ) : (
                <Check
                  size={24}
                  color={canSubmit ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
                  strokeWidth={2.5}
                />
              )}
            </Pressable>
          ),
        }}
      />

      <View style={[styles.root, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <View style={styles.content}>
          <EffortPicker selected={selectedEffort} onSelect={setSelectedEffort} />
        </View>

        {isEditing && (
          <View style={styles.footer}>
            <Pressable onPress={handleDelete} disabled={isSaving} style={styles.deleteButton}>
              <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
              <Text style={styles.deleteText}>Supprimer</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.horizontal,
  },
  footer: {
    padding: spacing.horizontal,
    paddingBottom: 34,
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
});
