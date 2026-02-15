import { useMemo, useCallback, useState } from "react";
import { View, ScrollView, Alert, ActivityIndicator, RefreshControl, StyleSheet, Platform, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing, colors } from "@/constants/theme";
import { useMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/use-match";
import { useMe } from "@/hooks/use-user";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreCard } from "@/features/matches/components/match-detail/score-card";
import { SetsCard } from "@/features/matches/components/match-detail/sets-card";
import { InfoCard } from "@/features/matches/components/match-detail/info-card";
import { VenueCard } from "@/features/matches/components/match-detail/venue-card";
import { FeedbackCard } from "@/features/matches/components/match-detail/feedback-card";
import { CommentsCard } from "@/features/matches/components/match-detail/comments-card";

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();

  const { data: matchDetail, isLoading, error, refetch } = useMatch(id);
  const { data: me } = useMe();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsManualRefresh(true);
    try {
      await refetch();
    } finally {
      setIsManualRefresh(false);
    }
  }, [refetch]);

  const currentUserId = me?.id ?? "";

  const isParticipant = useMemo(() => {
    if (!matchDetail || !currentUserId) return false;
    return matchDetail.participants.some((p) => p.userId === currentUserId);
  }, [matchDetail, currentUserId]);

  const matchStatus = matchDetail?.match.status;
  const isFinished = matchStatus === "finished";
  const isScheduled = matchStatus === "scheduled";
  const isOngoing = matchStatus === "ongoing";
  const hasUserCommented = (matchDetail?.comments ?? []).some(
    (c) => c.userId === currentUserId
  );

  // --- Actions ---

  const handleStart = () => {
    if (!matchDetail) return;
    updateMatch.mutate({
      id: matchDetail.match.id,
      data: { status: "ongoing", startedAt: new Date().toISOString() },
    });
  };

  const handleEditScores = () => {
    router.push(`/matches/${id}/edit-scores`);
  };

  const handleFinish = () => {
    if (!matchDetail) return;
    const winnerId = calculateWinner(matchDetail);
    updateMatch.mutate({
      id: matchDetail.match.id,
      data: {
        status: "finished",
        finishedAt: new Date().toISOString(),
        winnerId,
      },
    });
  };

  const handleEditMatch = () => {
    router.push(`/matches/${id}/edit-scores`);
  };

  const handleComment = () => {
    Alert.alert("Bientôt disponible", "Les commentaires arrivent prochainement.");
  };

  const handleDelete = () => {
    Alert.alert("Supprimer le match", "Es-tu sûr de vouloir supprimer ce match ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteMatch.mutate(id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
  };

  const handleEditFeedback = () => {
    Alert.alert("Bientôt disponible", "L'édition des sensations arrive prochainement.");
  };

  // --- Loading ---
  if (isLoading && !matchDetail) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <ActivityIndicator size="large" color={colors.accentGreen} />
      </View>
    );
  }

  // --- Error ---
  if (error && !matchDetail) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <EmptyState
          icon="TriangleAlert"
          title="Erreur"
          description="Impossible de charger le match."
        />
      </View>
    );
  }

  if (!matchDetail) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <EmptyState
          icon="TriangleAlert"
          title="Match introuvable"
          description="Ce match n'existe pas ou a été supprimé."
        />
      </View>
    );
  }
  
  return (
    <>
    <Stack.Screen
        options={{
          headerLeft:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={() => router.back()}>
                    <MaterialIcons name="close" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="xmark" onPress={() => router.back()} tintColor={colors.accentGreen} />
        </Stack.Toolbar>
      )}

      {isParticipant && (
        <Stack.Toolbar placement="bottom">
          {isScheduled && (
            <>
            <Stack.Toolbar.Button icon="play.fill" onPress={handleStart} tintColor={colors.accentGreen} />
            <Stack.Toolbar.Spacer />

            </>
          )}
          
          {isOngoing && (
            <>
            <Stack.Toolbar.Button icon="pencil" onPress={handleEditScores} tintColor={colors.accentGreen} />
            <Stack.Toolbar.Spacer />

            </>
          )}
          {isOngoing && (
            <>
            <Stack.Toolbar.Button icon="checkmark.circle" onPress={handleFinish} tintColor={colors.accentOrange} />
            <Stack.Toolbar.Spacer />
            </>
          )}
          {isFinished && (
            <>
            <Stack.Toolbar.Button icon="pencil" onPress={handleEditMatch} tintColor={colors.accentOrange} />
            <Stack.Toolbar.Spacer />
            </>
          )}
          {isFinished && !hasUserCommented && (
            <>
            <Stack.Toolbar.Button icon="bubble.left" onPress={handleComment} tintColor={colors.accentGreen} />
            <Stack.Toolbar.Spacer />
            </>
          )}
          <>
          <Stack.Toolbar.Button icon="trash" onPress={handleDelete} tintColor="#FF3B30" />
          </>
        </Stack.Toolbar>
      )}
      
    <View style={[styles.root, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 20 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isManualRefresh} onRefresh={handleRefresh} />
        }
      >
        <ScoreCard matchDetail={matchDetail} currentUserId={currentUserId} />

        {matchDetail.sets.length > 0 && <SetsCard matchDetail={matchDetail} />}

        <InfoCard matchDetail={matchDetail} />

        <VenueCard matchDetail={matchDetail} />

        {isFinished && matchDetail.myFeedback && (
          <FeedbackCard feedback={matchDetail.myFeedback} onEdit={handleEditFeedback} />
        )}

        {isFinished && (
          <CommentsCard
            matchDetail={matchDetail}
            currentUserId={currentUserId}
            isParticipant={isParticipant}
            onAddComment={handleComment}
            onEditComment={handleComment}
          />
        )}
      </ScrollView>
    </View>
    </>
  );
}

function calculateWinner(matchDetail: {
  sets: { scores?: { userId: string; games: number }[] | null }[];
}): string | null {
  const setsWon: Record<string, number> = {};

  for (const set of matchDetail.sets) {
    if (!set.scores || set.scores.length < 2) continue;

    const sorted = [...set.scores].sort((a, b) => b.games - a.games);
    if (sorted[0].games > sorted[1].games) {
      setsWon[sorted[0].userId] = (setsWon[sorted[0].userId] ?? 0) + 1;
    }
  }

  let winnerId: string | null = null;
  let maxSets = 0;
  for (const [userId, count] of Object.entries(setsWon)) {
    if (count > maxSets) {
      maxSets = count;
      winnerId = userId;
    }
  }

  return winnerId;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.horizontal,
    gap: 12,
  },
});
