import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
} from "@/tw";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Swords } from "lucide-react-native";
import { useMyMatches } from "@/hooks/useMatches";
import { MatchFilterChips } from "@/components/match/MatchFilterChips";
import { MatchRow } from "@/components/match/MatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import type { MatchStatus, MatchListItem } from "@/types/match";

export default function MatchesScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<MatchStatus | undefined>(
    undefined
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useMyMatches(statusFilter);

  const matches = useMemo(
    () => data?.pages.flatMap((page) => page.matches) ?? [],
    [data]
  );

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

  const renderItem = useCallback(
    ({ item }: { item: MatchListItem }) => (
      <View className="px-horizontal py-1.5">
        <MatchRow match={item} onPress={() => navigateToMatch(item.id)} />
      </View>
    ),
    [navigateToMatch]
  );

  const renderHeader = useCallback(() => {
    return (
      <View className="py-2">
        <MatchFilterChips selected={statusFilter} onChange={setStatusFilter} />
      </View>
    );
  }, [statusFilter]);

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
    if (isLoading) {
      return (
        <View className="mt-4 px-horizontal">
          <SkeletonList count={5} />
        </View>
      );
    }
    return (
      <EmptyState
        icon={Swords}
        title="Aucun match"
        description={
          statusFilter
            ? "Aucun match avec ce filtre"
            : "Vos matchs apparaîtront ici"
        }
      />
    );
  }, [isLoading, statusFilter]);

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Matchs
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/matches/create")}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-primary dark:bg-primary-dark items-center justify-center"
        >
          <Plus size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#34C759"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
