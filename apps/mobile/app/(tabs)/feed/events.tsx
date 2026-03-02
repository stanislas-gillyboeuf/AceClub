import { useState, useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useInfiniteEvents } from "@/hooks/use-event";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { EventRow } from "@/features/events/components/event-row";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatEventDateGroup } from "@/lib/format";
import { semanticColors, spacing } from "@/constants/theme";
import type { EventSummary } from "@/types/event";

type TimeTab = "upcoming" | "past";

const TAB_OPTIONS: { value: TimeTab; label: string }[] = [
  { value: "upcoming", label: "A venir" },
  { value: "past", label: "Passes" },
];

type ListItem =
  | { type: "header"; key: string; title: string }
  | { type: "event"; key: string; event: EventSummary };

export default function EventsScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [tab, setTab] = useState<TimeTab>("upcoming");

  const {
    data: eventsData,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEvents({ sortBy: tab, limit: 20 });

  const listItems = useMemo<ListItem[]>(() => {
    const events = eventsData?.pages.flatMap((p) => p.data) ?? [];
    if (events.length === 0) return [];

    const grouped = new Map<string, EventSummary[]>();
    for (const event of events) {
      const groupKey = formatEventDateGroup(event.startDate);
      const group = grouped.get(groupKey);
      if (group) {
        group.push(event);
      } else {
        grouped.set(groupKey, [event]);
      }
    }

    const items: ListItem[] = [];
    for (const [title, groupEvents] of grouped) {
      items.push({ type: "header", key: `header-${title}`, title });
      for (const event of groupEvents) {
        items.push({ type: "event", key: event.id, event });
      }
    }
    return items;
  }, [eventsData]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return (
          <View style={styles.dateHeader}>
            <Text style={[styles.dateHeaderText, { color: semanticColors.labelSecondary[scheme] }]}>
              {item.title}
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.eventRow}>
          <EventRow
            event={item.event}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/feed/event-detail",
                params: { eventId: item.event.id },
              })
            }
          />
        </View>
      );
    },
    [scheme, router],
  );

  return (
    <>
      <Stack.Screen options={{ title: "Evenements", headerLargeTitle: true }} />
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.segmentContainer}>
            <SegmentedControl options={TAB_OPTIONS} selected={tab} onSelect={setTab} />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="CalendarDays"
              title={tab === "upcoming" ? "Aucun evenement a venir" : "Aucun evenement passe"}
              description={
                tab === "upcoming"
                  ? "Les evenements a venir apparaitront ici"
                  : "Les evenements passes apparaitront ici"
              }
            />
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  segmentContainer: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 12,
  },
  dateHeader: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  eventRow: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 4,
  },
});
