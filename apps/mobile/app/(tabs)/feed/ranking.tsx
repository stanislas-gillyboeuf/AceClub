import { useCallback, useMemo, useState } from "react";
import {
  View,
  Platform,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Animated from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import {
  useInfiniteOrganizationLeaderboard,
  useInfiniteWeeklyLeaderboard,
} from "@/hooks/use-leaderboard";
import { useActiveClub } from "@/hooks/use-active-club";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { LeaderboardRow } from "@/features/leaderboard/components/leaderboard-row";
import { WeeklyLeaderboardRow } from "@/features/leaderboard/components/weekly-leaderboard-row";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";

import { colors, semanticColors, spacing } from "@/constants/theme";
import type { LeaderboardEntry, WeeklyLeaderboardEntry } from "@/types/leaderboard";

// The platform-wide "Global" leaderboard is now reserved to super-admins
// server-side (matches and feeds are club-scoped) — only "Club" and "Semaine"
// remain, and "Semaine" is now the club's weekly leaderboard, not a global one.
type LeaderboardType = "organization" | "weekly";

const LEADERBOARD_OPTIONS: { value: LeaderboardType; label: string }[] = [
  { value: "organization", label: "Club" },
  { value: "weekly", label: "Semaine" },
];

export default function Ranking() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LeaderboardType>("organization");

  const { activeClubId } = useActiveClub();
  const organizationId = activeClubId ?? "";

  // Organization leaderboard
  const {
    data: orgData,
    fetchNextPage: fetchNextOrg,
    hasNextPage: hasNextOrg,
    isFetchingNextPage: isFetchingNextOrg,
    isLoading: orgLoading,
    isRefetching: orgRefetching,
    refetch: refetchOrg,
  } = useInfiniteOrganizationLeaderboard(organizationId);

  // Weekly leaderboard (club-scoped)
  const {
    data: weeklyData,
    fetchNextPage: fetchNextWeekly,
    hasNextPage: hasNextWeekly,
    isFetchingNextPage: isFetchingNextWeekly,
    isLoading: weeklyLoading,
    isRefetching: weeklyRefetching,
    refetch: refetchWeekly,
  } = useInfiniteWeeklyLeaderboard(organizationId);

  // Flatten pages
  const orgEntries = useMemo(
    () => orgData?.pages.flatMap((p) => p.leaderboard) ?? [],
    [orgData]
  );
  const weeklyEntries = useMemo(
    () => weeklyData?.pages.flatMap((p) => p.leaderboard) ?? [],
    [weeklyData]
  );

  // Current state based on selected type
  const isLoading = selectedType === "organization" ? orgLoading : weeklyLoading;
  const isRefetching = selectedType === "organization" ? orgRefetching : weeklyRefetching;
  const isFetchingNext = selectedType === "organization" ? isFetchingNextOrg : isFetchingNextWeekly;
  const hasNext = selectedType === "organization" ? hasNextOrg : hasNextWeekly;

  const onEndReached = useCallback(() => {
    if (!hasNext || isFetchingNext) return;
    if (selectedType === "organization") fetchNextOrg();
    else fetchNextWeekly();
  }, [selectedType, hasNext, isFetchingNext, fetchNextOrg, fetchNextWeekly]);

  const onRefresh = useCallback(() => {
    if (selectedType === "organization") refetchOrg();
    else refetchWeekly();
  }, [selectedType, refetchOrg, refetchWeekly]);

  const goBack = () => router.dismiss();

  // Use a unified data structure for rendering
  const isWeekly = selectedType === "weekly";
  const entries: (LeaderboardEntry | WeeklyLeaderboardEntry)[] =
    selectedType === "organization" ? orgEntries : weeklyEntries;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Classement",
          headerLargeTitle: true,
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={goBack}>
                    <MaterialIcons name="close" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="xmark" onPress={goBack} />
        </Stack.Toolbar>
      )}

      <Animated.FlatList
        data={entries}
        keyExtractor={(item) => `${item.rank}-${item.user.id}`}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.pickerContainer}>
            <SegmentedControl
              options={LEADERBOARD_OPTIONS}
              selected={selectedType}
              onSelect={setSelectedType}
            />
          </View>
        }
        renderItem={({ item }) =>
          isWeekly ? (
            <WeeklyLeaderboardRow entry={item as WeeklyLeaderboardEntry} />
          ) : (
            <LeaderboardRow entry={item as LeaderboardEntry} />
          )
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} showAvatar lineCount={2} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="Trophy"
              title="Aucun classement"
              description="Les classements apparaîtront ici une fois les premiers matchs joués"
            />
          )
        }
        ListFooterComponent={
          isFetchingNext ? (
            <ActivityIndicator style={styles.loader} />
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
  pickerContainer: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 12,
  },
  loader: {
    paddingVertical: 16,
  },
});
