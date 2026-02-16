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
  useInfiniteGlobalLeaderboard,
  useInfiniteOrganizationLeaderboard,
  useInfiniteWeeklyLeaderboard,
} from "@/hooks/use-leaderboard";
import { useActiveMember } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { LeaderboardRow } from "@/features/leaderboard/components/leaderboard-row";
import { WeeklyLeaderboardRow } from "@/features/leaderboard/components/weekly-leaderboard-row";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";

import { colors, semanticColors, spacing } from "@/constants/theme";
import type { LeaderboardEntry, WeeklyLeaderboardEntry } from "@/types/leaderboard";

type LeaderboardType = "global" | "organization" | "weekly";

const LEADERBOARD_OPTIONS: { value: LeaderboardType; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "organization", label: "Club" },
  { value: "weekly", label: "Semaine" },
];

export default function Ranking() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LeaderboardType>("global");

  const { data: activeMember } = useActiveMember();
  const organizationId = activeMember?.organizationId ?? "";

  // Global leaderboard
  const {
    data: globalData,
    fetchNextPage: fetchNextGlobal,
    hasNextPage: hasNextGlobal,
    isFetchingNextPage: isFetchingNextGlobal,
    isLoading: globalLoading,
    isRefetching: globalRefetching,
    refetch: refetchGlobal,
  } = useInfiniteGlobalLeaderboard();

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

  // Weekly leaderboard
  const {
    data: weeklyData,
    fetchNextPage: fetchNextWeekly,
    hasNextPage: hasNextWeekly,
    isFetchingNextPage: isFetchingNextWeekly,
    isLoading: weeklyLoading,
    isRefetching: weeklyRefetching,
    refetch: refetchWeekly,
  } = useInfiniteWeeklyLeaderboard();

  // Flatten pages
  const globalEntries = useMemo(
    () => globalData?.pages.flatMap((p) => p.leaderboard) ?? [],
    [globalData]
  );
  const orgEntries = useMemo(
    () => orgData?.pages.flatMap((p) => p.leaderboard) ?? [],
    [orgData]
  );
  const weeklyEntries = useMemo(
    () => weeklyData?.pages.flatMap((p) => p.leaderboard) ?? [],
    [weeklyData]
  );

  // Current state based on selected type
  const isLoading =
    selectedType === "global"
      ? globalLoading
      : selectedType === "organization"
        ? orgLoading
        : weeklyLoading;

  const isRefetching =
    selectedType === "global"
      ? globalRefetching
      : selectedType === "organization"
        ? orgRefetching
        : weeklyRefetching;

  const isFetchingNext =
    selectedType === "global"
      ? isFetchingNextGlobal
      : selectedType === "organization"
        ? isFetchingNextOrg
        : isFetchingNextWeekly;

  const hasNext =
    selectedType === "global"
      ? hasNextGlobal
      : selectedType === "organization"
        ? hasNextOrg
        : hasNextWeekly;

  const onEndReached = useCallback(() => {
    if (!hasNext || isFetchingNext) return;
    if (selectedType === "global") fetchNextGlobal();
    else if (selectedType === "organization") fetchNextOrg();
    else fetchNextWeekly();
  }, [selectedType, hasNext, isFetchingNext, fetchNextGlobal, fetchNextOrg, fetchNextWeekly]);

  const onRefresh = useCallback(() => {
    if (selectedType === "global") refetchGlobal();
    else if (selectedType === "organization") refetchOrg();
    else refetchWeekly();
  }, [selectedType, refetchGlobal, refetchOrg, refetchWeekly]);

  const goBack = () => router.back();

  // Use a unified data structure for rendering
  const isWeekly = selectedType === "weekly";
  const entries: (LeaderboardEntry | WeeklyLeaderboardEntry)[] =
    selectedType === "global"
      ? globalEntries
      : selectedType === "organization"
        ? orgEntries
        : weeklyEntries;

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
          <Stack.Toolbar.Button icon="xmark" onPress={goBack} tintColor={colors.accentGreen} />
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
