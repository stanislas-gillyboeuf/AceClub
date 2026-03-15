import { useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useMyEvents, useInfiniteEvents } from "@/hooks/use-event";
import { SectionHeader } from "@/components/ui/section-header";
import { EventPreviewCard } from "./event-preview-card";
import { DiscoverMoreCard } from "./discover-more-card";
import { spacing } from "@/constants/theme";

export function EventsFeedSection() {
  const router = useRouter();
  const { data: myEvents, isLoading: myEventsLoading } = useMyEvents({
    status: "registered",
    timeFilter: "upcoming",
    limit: 10,
  });

  const hasMyEvents = (myEvents?.length ?? 0) > 0;

  const { data: discoverData, isLoading: discoverLoading } = useInfiniteEvents(
    { sortBy: "upcoming", limit: 5 },
  );

  const discoverEvents = useMemo(
    () => discoverData?.pages.flatMap((p) => p.data) ?? [],
    [discoverData],
  );

  const goToEvents = () => router.push("/(tabs)/feed/events");
  const goToEventDetail = (eventId: string) =>
    router.push({ pathname: "/(tabs)/feed/event-detail", params: { eventId } });

  // User has registered events
  if (hasMyEvents && myEvents) {
    return (
      <View style={styles.section}>
        <SectionHeader title="Evenements" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {myEvents.map((event) => (
            <EventPreviewCard
              key={event.id}
              event={event}
              onPress={() => goToEventDetail(event.id)}
            />
          ))}
          <DiscoverMoreCard onPress={goToEvents} />
        </ScrollView>
      </View>
    );
  }

  // No registered events — show available events
  if (!myEventsLoading && !hasMyEvents && discoverEvents.length > 0) {
    return (
      <View style={styles.section}>
        <SectionHeader title="Evenements a decouvrir" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {discoverEvents.map((event) => (
            <EventPreviewCard
              key={event.id}
              event={event}
              onPress={() => goToEventDetail(event.id)}
            />
          ))}
          <DiscoverMoreCard onPress={goToEvents} />
        </ScrollView>
      </View>
    );
  }

  // Still loading or nothing to show
  return null;
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
  },
  horizontalScroll: {
    gap: 12,
  },
});
