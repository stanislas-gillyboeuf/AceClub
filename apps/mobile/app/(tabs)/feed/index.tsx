import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "@/tw";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Trophy, Swords } from "lucide-react-native";
import { useFeedMatches } from "@/hooks/useMatches";
import { useMyLevel } from "@/hooks/useLevel";
import { useAuthStore } from "@/stores/auth";
import { LevelProgressCard } from "@/components/progression/LevelProgressCard";
import { OngoingMatchCard } from "@/components/match/OngoingMatchCard";
import { FeedMatchRow } from "@/components/match/FeedMatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonList } from "@/components/ui/Skeleton";
import type { MatchListItem } from "@/types/match";

export default function FeedScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";

  const {
    data: matchesData,
    isLoading: matchesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchMatches,
    isRefetching: isRefetchingMatches,
  } = useFeedMatches();

  const {
    data: levelData,
    isLoading: levelLoading,
    refetch: refetchLevel,
    isRefetching: isRefetchingLevel,
  } = useMyLevel();

  const allMatches = useMemo(
    () => matchesData?.pages.flatMap((page) => page.matches) ?? [],
    [matchesData]
  );

  const ongoingMatches = useMemo(
    () => allMatches.filter((m) => m.status === "ongoing"),
    [allMatches]
  );

  const finishedMatches = useMemo(
    () => allMatches.filter((m) => m.status === "finished"),
    [allMatches]
  );

  const isRefreshing = isRefetchingMatches || isRefetchingLevel;

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchMatches(), refetchLevel()]);
  }, [refetchMatches, refetchLevel]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const navigateToMatch = useCallback(
    (matchId: string) => {
      router.push(`/(tabs)/matches/${matchId}`);
    },
    [router]
  );

  const renderHeader = useCallback(() => {
    return (
      <View className="gap-2">
        {/* Level progress card */}
        <View className="px-horizontal py-2">
          {levelLoading ? (
            <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-lg">
              <Skeleton height={16} width="40%" />
              <View className="mt-2">
                <Skeleton height={12} width="60%" />
              </View>
              <View className="mt-4">
                <Skeleton height={12} borderRadius={6} />
              </View>
            </View>
          ) : levelData ? (
            <LevelProgressCard
              userLevel={levelData}
              onPress={() => router.push("/(tabs)/profile/progression")}
            />
          ) : null}
        </View>

        {/* Ongoing matches horizontal scroll */}
        {ongoingMatches.length > 0 && (
          <View className="py-1">
            <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide px-horizontal mb-2">
              En cours
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {ongoingMatches.map((match) => (
                <OngoingMatchCard
                  key={match.id}
                  match={match}
                  onPress={() => navigateToMatch(match.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section header for recent matches */}
        <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide px-horizontal mt-1">
          Matchs récents au club
        </Text>
      </View>
    );
  }, [
    levelLoading,
    levelData,
    ongoingMatches,
    navigateToMatch,
    router,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: MatchListItem }) => (
      <View className="px-horizontal py-1.5">
        <FeedMatchRow
          match={item}
          currentUserId={currentUserId}
          onPress={() => navigateToMatch(item.id)}
        />
      </View>
    ),
    [currentUserId, navigateToMatch]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator color="#34C759" />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (matchesLoading) {
      return (
        <View className="mt-4">
          <SkeletonList count={4} />
        </View>
      );
    }
    return (
      <EmptyState
        icon={Swords}
        title="Aucun match récent"
        description="Vos matchs récents au club apparaîtront ici"
      />
    );
  }, [matchesLoading]);

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Activité
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/profile/leaderboard")}
          hitSlop={8}
        >
          <Trophy size={22} color="#34C759" />
        </Pressable>
      </View>

      <FlatList
        data={finishedMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#34C759"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
