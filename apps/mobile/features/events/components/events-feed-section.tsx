import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { useRouter } from "expo-router";
import { useMyEvents, useInfiniteEvents } from "@/hooks/use-event";
import { useActiveClub } from "@/hooks/use-active-club";
import { EventCard } from "./event-card";
import { semanticColors, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { EventSummary, MyEvent } from "@/types/event";

const CARD_WIDTH = 300;
const GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + GAP;

export function EventsFeedSection() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { activeClubId } = useActiveClub();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: myEvents } = useMyEvents({
    status: "registered",
    timeFilter: "upcoming",
    limit: 10,
  });

  const { data: discoverData } = useInfiniteEvents({
    organizationId: activeClubId ?? undefined,
    sortBy: "upcoming",
    limit: 5,
  });

  const discoverEvents = useMemo(
    () => discoverData?.pages.flatMap((p) => p.data) ?? [],
    [discoverData],
  );

  const events = useMemo<(EventSummary | MyEvent)[]>(() => {
    const registered = myEvents ?? [];
    const registeredIds = new Set(registered.map((e) => e.id));
    const others = discoverEvents.filter((e) => !registeredIds.has(e.id));
    return [...registered, ...others];
  }, [myEvents, discoverEvents]);

  const goToEvents = () => router.push("/(tabs)/feed/events");
  const goToEventDetail = (eventId: string) =>
    router.push({ pathname: "/(tabs)/feed/event-detail", params: { eventId } });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(Math.max(0, Math.min(index, events.length - 1)));
  };

  if (events.length === 0) {
    return null;
  }

  const title = myEvents?.length ? "ÉVÉNEMENTS" : "ÉVÉNEMENTS À DÉCOUVRIR";

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>{title}</Text>
        <Pressable onPress={goToEvents} hitSlop={8} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: semanticColors.accentGreen[scheme] }]}>Tout voir</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={events}
        keyExtractor={(event) => event.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <EventCard event={item} variant="large" onPress={() => goToEventDetail(item.id)} />
        )}
      />

      {events.length > 1 ? (
        <View style={styles.dots}>
          {events.map((event, index) => (
            <View
              key={event.id}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
                {
                  backgroundColor:
                    index === activeIndex ? semanticColors.accentGreen[scheme] : semanticColors.borderColor[scheme],
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.horizontal,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  seeAllButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: spacing.horizontal,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
  dotInactive: {
    width: 6,
  },
});
