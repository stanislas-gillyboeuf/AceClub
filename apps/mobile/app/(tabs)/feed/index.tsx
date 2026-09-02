import { useCallback, useMemo } from "react";
import { Stack, useRouter } from "expo-router";
import {
  View,
  Platform,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useMe } from "@/hooks/use-user";
import { useMyLevel } from "@/hooks/use-level";
import { useInfiniteMatches } from "@/hooks/use-match";
import { useActiveMember } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { MessagesHeaderButton } from "@/features/chat/components/MessagesHeaderButton";
import { MessagesToolbarButton } from "@/components/ui/messages-toolbar-button";
import { LevelProgressCard } from "@/features/feed/components/level-progress-card";
import { FeedMatchRow } from "@/features/feed/components/feed-match-row";
import { EventsFeedSection } from "@/features/events/components/events-feed-section";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";

import { colors, semanticColors, spacing } from "@/constants/theme";

export default function Feed() {
  const scheme = useColorScheme();
  const { data: me } = useMe();
  const { data: level, isLoading: levelLoading } = useMyLevel();
  const router = useRouter();

  const goToRanking = () => router.push("/(tabs)/feed/ranking");
  const goToProgression = () => router.push("/(tabs)/feed/progression");

  const { data: activeMember } = useActiveMember();
  const organizationId = activeMember?.organizationId;

  const {
    data: finishedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: finishedLoading,
    isRefetching,
    refetch,
  } = useInfiniteMatches({
    status: "finished",
    limit: 20,
    organizationId,
    participantOnly: false,
  });

  const finishedMatches = useMemo(
    () => finishedData?.pages.flatMap((p) => p.matches) ?? [],
    [finishedData]
  );

  const currentUserId = me?.id ?? "";

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Activite",
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <View style={styles.androidHeaderRight}>
                    <Pressable onPress={goToRanking}>
                      <MaterialIcons name="emoji-events" size={24} color={colors.accentGreen} />
                    </Pressable>
                    <MessagesHeaderButton />
                  </View>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="trophy" onPress={goToRanking} tintColor={colors.accentGreen} />
          <MessagesToolbarButton />
        </Stack.Toolbar>
      )}

      <Animated.FlatList
        data={finishedMatches}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={LinearTransition}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            {/* Level progress card */}
            <View style={styles.section}>
              {levelLoading ? (
                <SkeletonRow showAvatar={false} lineCount={2} />
              ) : level ? (
                <LevelProgressCard
                  level={level}
                  showDetailIndicator
                  onPress={goToProgression}
                />
              ) : null}
            </View>

            {/* Events */}
            <EventsFeedSection />

            {/* Recent matches section header */}
            {finishedMatches.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Matchs récents" />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.matchRow}>
            <FeedMatchRow
              match={item}
              currentUserId={currentUserId}
              onPress={() => router.push(`/(tabs)/matches/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          !finishedLoading ? (
            <EmptyState
              icon="CircleDot"
              title="Aucun match recent"
              description="Vos matchs recents au club apparaitront ici"
            />
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  androidHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
  },
  matchRow: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
  },
  loader: {
    paddingVertical: 16,
  },
});
