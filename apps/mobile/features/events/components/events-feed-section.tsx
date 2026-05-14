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
  const { data: myEvents } = useMyEvents({
    status: "registered",
    timeFilter: "upcoming",
    limit: 10,
  });

  const { data: discoverData } = useInfiniteEvents({
    sortBy: "upcoming",
    limit: 5,
  });

  const discoverEvents = useMemo(
    () => discoverData?.pages.flatMap((p) => p.data) ?? [],
    [discoverData],
  );

  const events = useMemo(() => {
    const registered = myEvents ?? [];
    const registeredIds = new Set(registered.map((e) => e.id));
    const others = discoverEvents.filter((e) => !registeredIds.has(e.id));
    return [...registered, ...others];
  }, [myEvents, discoverEvents]);

  const goToEvents = () => router.push("/(tabs)/feed/events");
  const goToEventDetail = (eventId: string) =>
    router.push({ pathname: "/(tabs)/feed/event-detail", params: { eventId } });

  if (events.length === 0) {
    return null;
  }

  const title = myEvents?.length ? "Evenements" : "Evenements a decouvrir";

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {events.map((event) => (
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

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
  },
  horizontalScroll: {
    gap: 12,
  },
});
