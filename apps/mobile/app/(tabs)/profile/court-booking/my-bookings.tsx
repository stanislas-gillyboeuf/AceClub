import { useState, useCallback } from "react";
import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useMyBookings } from "@/hooks/use-court";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingRow } from "@/features/court-booking/components/booking-row";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing } from "@/constants/theme";
import type { CourtBooking, MyBookingsFilter } from "@/types/court";

const TAB_OPTIONS: { value: MyBookingsFilter; label: string }[] = [
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passées" },
];

export default function MyBookingsScreen() {
  const scheme = useColorScheme();
  const [tab, setTab] = useState<MyBookingsFilter>("upcoming");

  const { data: bookings, isLoading, isRefetching, refetch } = useMyBookings(tab);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <Stack.Screen options={{ title: "Mes réservations", headerLargeTitle: true }} />
      <FlatList
        data={bookings ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: CourtBooking }) => (
          <View style={styles.row}>
            <BookingRow booking={item} />
          </View>
        )}
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.segmentContainer}>
            <SegmentedControl options={TAB_OPTIONS} selected={tab} onSelect={setTab} />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="CalendarX2"
              title={tab === "upcoming" ? "Aucune réservation à venir" : "Aucune réservation passée"}
              description={
                tab === "upcoming"
                  ? "Réserve un terrain pour le voir apparaître ici."
                  : "Tes réservations passées apparaîtront ici."
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
  row: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 4,
  },
});
