import { useMemo, useCallback, useState } from "react";
import { View, ScrollView, Alert, ActivityIndicator, RefreshControl, StyleSheet, Platform, PlatformColor, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing, colors } from "@/constants/theme";
import { useMatch, useUpdateMatch, useDeleteMatch, useUpdateFeedback } from "@/hooks/use-match";
import { useTakeMatchPhoto } from "@/features/matches/hooks/use-take-match-photo";
import { useMe } from "@/hooks/use-user";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreCard } from "@/features/matches/components/match-detail/score-card";
import { SetsCard } from "@/features/matches/components/match-detail/sets-card";
import { InfoCard } from "@/features/matches/components/match-detail/info-card";
import { VenueCard } from "@/features/matches/components/match-detail/venue-card";
import { CommentsCard } from "@/features/matches/components/match-detail/comments-card";
import { ElapsedTimerCard } from "@/features/matches/components/match-detail/elapsed-timer-card";
import { PhotoCard } from "@/features/matches/components/match-detail/photo-card";
import { SheetActionBar } from "@/features/matches/components/match-detail/floating-action-bar";
import { FeedbackCta } from "@/features/matches/components/feedback/feedback-cta";
import { VisibilityToggle } from "@/features/matches/components/feedback/visibility-toggle";

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();

  const { data: matchDetail, isLoading, error, refetch } = useMatch(id);
  const { data: me } = useMe();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const updateFeedback = useUpdateFeedback();
  const { takePhoto: handleTakePhoto } = useTakeMatchPhoto(id);
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
  const hasUserPhoto = (matchDetail?.photos ?? []).some(
    (p) => p.userId === currentUserId
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
    router.push(`/matches/${id}/comment`);
  };

  const handleDelete = () => {
    Alert.alert("Supprimer le match", "Es-tu sûr de vouloir supprimer ce match ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteMatch.mutate(id, {
            onSuccess: () => router.dismiss(),
          });
        },
      },
    ]);
  };

  const handleFeedback = () => {
    router.push(`/matches/${id}/feedback`);
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
                  <Pressable onPress={() => router.dismiss()}>
                    <MaterialIcons name="close" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="xmark" onPress={() => router.dismiss()} />
          </Stack.Toolbar>

          {isParticipant && (
            <Stack.Toolbar placement="bottom">
              {isScheduled && (
                <>
                  <Stack.Toolbar.Button icon="play.fill" variant="prominent" onPress={handleStart} tintColor={colors.accentGreen} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {isOngoing && (
                <>
                  <Stack.Toolbar.Button icon="pencil" variant="prominent" onPress={handleEditScores} tintColor={colors.accentGreen} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {isOngoing && (
                <>
                  <Stack.Toolbar.Button icon="checkmark.circle" variant="prominent" onPress={handleFinish} tintColor={colors.accentOrange} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {isFinished && (
                <>
                  <Stack.Toolbar.Button icon="pencil" variant="prominent" onPress={handleEditMatch} tintColor={colors.accentOrange} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {(isOngoing || isFinished) && !hasUserPhoto && (
                <>
                  <Stack.Toolbar.Button icon="camera" variant="prominent" onPress={handleTakePhoto} tintColor={colors.accentGreen} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {isFinished && !matchDetail?.myFeedback && (
                <>
                  <Stack.Toolbar.Button icon="face.smiling" variant="prominent" onPress={handleFeedback} tintColor={colors.accentGreen} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              {isFinished && !hasUserCommented && (
                <>
                  <Stack.Toolbar.Button icon="bubble.left" variant="prominent" onPress={handleComment} tintColor={colors.accentGreen} />
                  <Stack.Toolbar.Spacer />
                </>
              )}
              <Stack.Toolbar.Button icon="trash" variant="prominent" onPress={handleDelete} tintColor="#FF3B30" />
            </Stack.Toolbar>
          )}
        </>
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

        {isOngoing && matchDetail.match.startedAt && (
          <ElapsedTimerCard startedAt={matchDetail.match.startedAt} />
        )}

        {(isOngoing || isFinished) && (
          <PhotoCard
            matchDetail={matchDetail}
            currentUserId={currentUserId}
            isParticipant={isParticipant}
          />
        )}

        {matchDetail.sets.length > 0 && <SetsCard matchDetail={matchDetail} />}

        <InfoCard
          matchDetail={matchDetail}
          isScheduled={isScheduled}
          onUpdateScheduledDate={(date) => {
            updateMatch.mutate({
              id: matchDetail.match.id,
              data: { scheduledAt: date.toISOString() },
            });
          }}
        />

        <VenueCard matchDetail={matchDetail} isParticipant={isParticipant} isScheduled={isScheduled} />

        {isFinished && isParticipant && (
          <FeedbackCta
            onEffort={handleFeedback}
            onComment={handleComment}
            hasEffort={!!matchDetail.myFeedback}
            hasComment={hasUserCommented}
          />
        )}

        {isFinished && isParticipant && matchDetail.myFeedback && (
          <VisibilityToggle
            value={matchDetail.myFeedback.visibleToClub}
            onValueChange={(val) => {
              updateFeedback.mutate({
                matchId: matchDetail.match.id,
                data: { visibleToClub: val },
              });
            }}
          />
        )}

        {isFinished && (
          <CommentsCard
            matchDetail={matchDetail}
            currentUserId={currentUserId}
            isParticipant={isParticipant}
            onAddComment={handleComment}
            onEditComment={() => handleComment()}
          />
        )}

        {Platform.OS === "android" && (
          <SheetActionBar
            matchDetail={matchDetail}
            currentUserId={currentUserId}
            isParticipant={isParticipant}
            onStart={handleStart}
            onEditScores={handleEditScores}
            onFinish={handleFinish}
            onEditMatch={handleEditMatch}
            onComment={handleComment}
            onDelete={handleDelete}
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
