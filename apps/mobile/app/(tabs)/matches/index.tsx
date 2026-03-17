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
import { WeekDateStripSkeleton } from "@/features/matches/components/week-date-strip-skeleton";
import { WeekDateStrip } from "@/features/matches/components/WeekDateStrip";
import { EmptyState } from "@/components/ui/empty-state";
import { startOfDay, formatDayKey, getMatchDisplayDate } from "@/lib/date";
import type { MatchWithParticipants } from "@/types/match";

function ItemSeparator() {
  return <View style={separatorStyle} />;
}
const separatorStyle = { height: 12 };

export default function Matches() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const handleChangeWeek = (direction: -1 | 1) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * 7);
      return d;
    });
  };

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

  const { matchCountByDay, filteredMatches } = useMemo(() => {
    const selectedKey = formatDayKey(selectedDate);
    const map = new Map<string, number>();
    const filtered: MatchWithParticipants[] = [];

    for (const match of allMatches) {
      const key = formatDayKey(startOfDay(new Date(getMatchDisplayDate(match))));
      map.set(key, (map.get(key) ?? 0) + 1);
      if (key === selectedKey) filtered.push(match);
    }

    return { matchCountByDay: map, filteredMatches: filtered };
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
      onChangeWeek={handleChangeWeek}
    />
  );

  if (isLoading && allMatches.length === 0) {
    return (
      <View style={styles.container}>
        {toolbar}
        <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <WeekDateStripSkeleton />
          <View style={styles.skeletonList}>
            {Array.from({ length: 3 }).map((_, i) => (
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
        ItemSeparatorComponent={ItemSeparator}
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
