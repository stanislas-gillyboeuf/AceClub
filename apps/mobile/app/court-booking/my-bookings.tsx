import { useState, useCallback } from "react";
import { View, Text, Pressable, FlatList, RefreshControl, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { courtColors, courtFonts } from "@/features/court-booking/theme";
import { useMyBookings } from "@/hooks/use-court";
import { BookingRow } from "@/features/court-booking/components/dark/booking-row";
import type { CourtBooking, MyBookingsFilter } from "@/types/court";

const TAB_OPTIONS: { value: MyBookingsFilter; label: string }[] = [
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passées" },
];

export default function MyBookingsScreen() {
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
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={courtColors.ball}
          />
        }
        ListHeaderComponent={
          <View style={styles.segmentContainer}>
            <View style={styles.segment}>
              {TAB_OPTIONS.map((option) => {
                const isSelected = option.value === tab;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setTab(option.value)}
                    style={[styles.segmentItem, isSelected && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {tab === "upcoming" ? "Aucune réservation à venir" : "Aucune réservation passée"}
              </Text>
              <Text style={styles.emptyDescription}>
                {tab === "upcoming"
                  ? "Réserve un terrain pour le voir apparaître ici."
                  : "Tes réservations passées apparaîtront ici."}
              </Text>
            </View>
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink,
  },
  listContent: {
    paddingBottom: 32,
  },
  segmentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: courtColors.ink2,
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentItemActive: {
    backgroundColor: courtColors.ball,
  },
  segmentText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 13,
    color: courtColors.mist,
  },
  segmentTextActive: {
    color: courtColors.ink,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: courtFonts.bodyBold,
    fontSize: 15,
    color: courtColors.chalk,
  },
  emptyDescription: {
    fontFamily: courtFonts.bodyRegular,
    fontSize: 13.5,
    color: courtColors.mist,
    textAlign: "center",
  },
});
