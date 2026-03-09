import { useMemo, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter } from "expo-router";
import {
  View,
  Platform,
  Pressable,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { useInfiniteMatches } from "@/hooks/use-match";
import { MatchRow } from "@/features/matches/components/match-row";
import { MatchRowSkeleton } from "@/features/matches/components/match-row-skeleton";
import { WeekDateStrip } from "@/features/matches/components/WeekDateStrip";
import { EmptyState } from "@/components/ui/empty-state";
import { startOfDay, formatDayKey } from "@/lib/date";
import type { MatchWithParticipants } from "@/types/match";

export default function Matches() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteMatches({ limit: 20 });

  const allMatches = useMemo(
    () => data?.pages.flatMap((page) => page.matches) ?? [],
    [data]
  );

  const matchCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const match of allMatches) {
      const dateStr = match.scheduledAt ?? match.startedAt ?? match.createdAt;
      const key = formatDayKey(startOfDay(new Date(dateStr)));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    const selectedKey = formatDayKey(selectedDate);
    return allMatches.filter((match) => {
      const dateStr = match.scheduledAt ?? match.startedAt ?? match.createdAt;
      return formatDayKey(startOfDay(new Date(dateStr))) === selectedKey;
    });
  }, [allMatches, selectedDate]);

  const onCreateMatch = () => {
    router.push("/matches/create");
  };

  const onOpenRequests = () => {
    router.push("/matches/requests");
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const renderItem = ({ item }: { item: MatchWithParticipants }) => (
    <View style={styles.rowContainer}>
      <MatchRow match={item} onPress={() => router.push(`/matches/${item.id}`)} />
    </View>
  );

  const toolbar = (
    <>
      <Stack.Screen
        options={{
          title: "Matchs",
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={onOpenRequests}>
                    <MaterialIcons name="mail-outline" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="envelope.badge" onPress={onOpenRequests} tintColor={colors.accentGreen} />
        </Stack.Toolbar>
      )}
    </>
  );

  const fab = (
    <Pressable
      onPress={onCreateMatch}
      style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 24 }, pressed && styles.fabPressed]}
    >
      <GlassView style={styles.fabGlass} tintColor={colors.accentGreen}>
        <Plus size={28} color={colors.white} />
      </GlassView>
    </Pressable>
  );

  const listHeader = (
    <WeekDateStrip
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      matchCountByDay={matchCountByDay}
      weekOffset={weekOffset}
      onChangeWeek={setWeekOffset}
    />
  );

  if (isLoading && allMatches.length === 0) {
    return (
      <View style={styles.container}>
        {toolbar}
        <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <View style={styles.skeletonList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MatchRowSkeleton key={i} />
            ))}
          </View>
        </View>
        {fab}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {toolbar}
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="Swords"
              title="Aucun match ce jour"
              description="Planifie un match et lance-toi !"
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      />
      {fab}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonList: {
    padding: spacing.horizontal,
    paddingTop: 16,
    gap: 12,
  },
  emptyContainer: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 32,
  },
  listContent: {
    paddingBottom: 32,
  },
  rowContainer: {
    paddingHorizontal: spacing.horizontal,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
  },
  fabGlass: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
