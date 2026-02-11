import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "@/tw";
import {
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Pencil, Trash2, Play, Flag } from "lucide-react-native";
import { useMatchDetail, useUpdateMatch } from "@/hooks/useMatch";
import { useDeleteMatch } from "@/hooks/useMatches";
import { useAuthStore } from "@/stores/auth";
import { MatchScoreCard } from "@/components/match/MatchScoreCard";
import { MatchSetsCard } from "@/components/match/MatchSetsCard";
import { MatchInfoCard } from "@/components/match/MatchInfoCard";
import { MatchCommentsCard } from "@/components/match/MatchCommentsCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";

  const { data, isLoading, refetch, isRefetching } = useMatchDetail(id);
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const isParticipant =
    data?.participants.some((p) => p.userId === currentUserId) ?? false;
  const isCreator = data?.match.createdBy === currentUserId;
  const matchStatus = data?.match.status;

  const handleStartMatch = useCallback(() => {
    if (!id) return;
    updateMatch.mutate({
      id,
      data: {
        status: "ongoing",
        startedAt: new Date().toISOString(),
      },
    });
  }, [id, updateMatch]);

  const handleFinishMatch = useCallback(() => {
    if (!id) return;

    // Find winner (participant with most set wins)
    const home = data?.participants.find((p) => p.side === "home");
    const away = data?.participants.find((p) => p.side === "away");
    let homeWins = 0;
    let awayWins = 0;

    for (const set of data?.sets ?? []) {
      const scores = set.scores;
      if (scores.length === 2) {
        const homeSc = scores.find((s) => s.side === "home")?.games ?? 0;
        const awaySc = scores.find((s) => s.side === "away")?.games ?? 0;
        if (homeSc > awaySc) homeWins++;
        else if (awaySc > homeSc) awayWins++;
      }
    }

    const winnerId =
      homeWins > awayWins
        ? home?.userId
        : awayWins > homeWins
          ? away?.userId
          : null;

    updateMatch.mutate({
      id,
      data: {
        status: "finished",
        finishedAt: new Date().toISOString(),
        winnerId: winnerId ?? null,
      },
    });
  }, [id, data, updateMatch]);

  const handleDeleteMatch = useCallback(() => {
    Alert.alert(
      "Supprimer le match",
      "Voulez-vous vraiment supprimer ce match ? Cette action est irréversible.",
      [
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
      ]
    );
  }, [id, deleteMatch, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
        <View className="px-horizontal pt-4 gap-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={24} color="#8E8E93" />
            </Pressable>
            <Skeleton height={24} width="40%" />
          </View>
          <Skeleton height={120} borderRadius={12} />
          <Skeleton height={160} borderRadius={12} />
          <Skeleton height={100} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark items-center justify-center">
        <Text className="text-label-secondary font-sans">
          Match introuvable
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          {isParticipant && matchStatus === "ongoing" && (
            <Pressable
              onPress={() =>
                router.push(`/(tabs)/matches/${id}/edit-scores`)
              }
              hitSlop={8}
            >
              <Pencil size={20} color="#34C759" />
            </Pressable>
          )}
          {isCreator && matchStatus !== "finished" && (
            <Pressable onPress={handleDeleteMatch} hitSlop={8}>
              <Trash2 size={20} color="#FF3B30" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#34C759"
          />
        }
      >
        {/* Score Card */}
        <MatchScoreCard
          participants={data.participants}
          sets={data.sets}
          status={data.match.status}
        />

        {/* Sets Detail */}
        <MatchSetsCard
          sets={data.sets}
          participants={data.participants}
        />

        {/* Match Info */}
        <MatchInfoCard
          match={data.match}
          venueOrganization={data.venueOrganization}
        />

        {/* Comments */}
        <MatchCommentsCard
          matchId={id}
          comments={data.comments}
          matchStatus={data.match.status}
        />

        {/* Action buttons */}
        {isParticipant && matchStatus === "scheduled" && (
          <Pressable
            onPress={handleStartMatch}
            disabled={updateMatch.isPending}
            className="flex-row items-center justify-center gap-2 bg-primary dark:bg-primary-dark rounded-sm h-button"
          >
            {updateMatch.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Play size={18} color="#FFFFFF" />
                <Text className="text-white font-sans-semibold text-base">
                  Démarrer le match
                </Text>
              </>
            )}
          </Pressable>
        )}

        {isParticipant && matchStatus === "ongoing" && (
          <View className="gap-3">
            <Pressable
              onPress={() =>
                router.push(`/(tabs)/matches/${id}/edit-scores`)
              }
              className="flex-row items-center justify-center gap-2 bg-bg-card dark:bg-bg-card-dark rounded-sm h-button border-[0.5px] border-border dark:border-border-dark"
            >
              <Pencil size={18} color="#34C759" />
              <Text className="text-primary dark:text-primary-dark font-sans-semibold text-base">
                Modifier les scores
              </Text>
            </Pressable>

            <Pressable
              onPress={handleFinishMatch}
              disabled={updateMatch.isPending}
              className="flex-row items-center justify-center gap-2 bg-primary dark:bg-primary-dark rounded-sm h-button"
            >
              {updateMatch.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Flag size={18} color="#FFFFFF" />
                  <Text className="text-white font-sans-semibold text-base">
                    Terminer le match
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
