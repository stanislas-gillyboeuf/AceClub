import { useCallback } from "react";
import {
  View,
  Text,
  Platform,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Animated from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useMyLevel } from "@/hooks/use-level";
import { useMyStreak } from "@/hooks/use-streak";
import { useMyChallenges } from "@/hooks/use-challenge";
import { useMyBadges, useAllBadges } from "@/hooks/use-reward";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { LevelProgressCard } from "@/features/feed/components/level-progress-card";
import { StreakCard } from "@/features/progression/components/streak-card";
import { ChallengeRow } from "@/features/progression/components/challenge-row";
import { BadgeGrid } from "@/features/progression/components/badge-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";

import { colors, semanticColors, spacing } from "@/constants/theme";
import type { Badge as BadgeType } from "@/types/reward";

export default function Progression() {
  const scheme = useColorScheme();
  const router = useRouter();

  const {
    data: level,
    isLoading: levelLoading,
    refetch: refetchLevel,
  } = useMyLevel();
  const {
    data: streak,
    isLoading: streakLoading,
    refetch: refetchStreak,
  } = useMyStreak();
  const {
    data: challengesData,
    isLoading: challengesLoading,
    refetch: refetchChallenges,
  } = useMyChallenges();
  const {
    data: myBadgesData,
    isLoading: badgesLoading,
    refetch: refetchMyBadges,
  } = useMyBadges();
  const { data: allBadgesData, refetch: refetchAllBadges } = useAllBadges();

  const challenges = challengesData?.challenges ?? [];
  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  // Merge badges: all badges with unlocked status from myBadges
  const myBadgeIds = new Set((myBadgesData?.badges ?? []).map((b) => b.id));
  const mergedBadges: BadgeType[] = (allBadgesData?.badges ?? []).map((badge) => ({
    ...badge,
    isUnlocked: myBadgeIds.has(badge.id),
  }));
  const unlockedCount = myBadgesData?.badges.length ?? 0;
  const totalCount = allBadgesData?.badges.length ?? 0;

  const isRefreshing =
    levelLoading || streakLoading || challengesLoading || badgesLoading;

  const onRefresh = useCallback(() => {
    refetchLevel();
    refetchStreak();
    refetchChallenges();
    refetchMyBadges();
    refetchAllBadges();
  }, [refetchLevel, refetchStreak, refetchChallenges, refetchMyBadges, refetchAllBadges]);

  const goBack = () => router.back();

  // Build sections as data for FlatList
  type SectionItem =
    | { type: "level" }
    | { type: "streak" }
    | { type: "challenges-header" }
    | { type: "challenge"; id: string; index: number }
    | { type: "challenges-empty" }
    | { type: "completed-header" }
    | { type: "completed-challenge"; id: string; index: number }
    | { type: "badges-header" }
    | { type: "badges-grid" }
    | { type: "badges-empty" }
    | { type: "loading" };

  const sections: SectionItem[] = [];

  // Level
  if (levelLoading) {
    sections.push({ type: "loading" });
  } else if (level) {
    sections.push({ type: "level" });
  }

  // Streak
  if (streakLoading) {
    sections.push({ type: "loading" });
  } else if (streak) {
    sections.push({ type: "streak" });
  }

  // Active challenges
  sections.push({ type: "challenges-header" });
  if (challengesLoading) {
    sections.push({ type: "loading" });
  } else if (activeChallenges.length > 0) {
    activeChallenges.forEach((c, i) =>
      sections.push({ type: "challenge", id: c.id, index: i })
    );
  } else {
    sections.push({ type: "challenges-empty" });
  }

  // Completed challenges
  if (completedChallenges.length > 0) {
    sections.push({ type: "completed-header" });
    completedChallenges.forEach((c, i) =>
      sections.push({ type: "completed-challenge", id: c.id, index: i })
    );
  }

  // Badges
  sections.push({ type: "badges-header" });
  if (badgesLoading) {
    sections.push({ type: "loading" });
  } else if (mergedBadges.length > 0) {
    sections.push({ type: "badges-grid" });
  } else {
    sections.push({ type: "badges-empty" });
  }

  const getItemKey = (item: SectionItem, index: number): string => {
    switch (item.type) {
      case "challenge":
        return `challenge-${item.id}`;
      case "completed-challenge":
        return `completed-${item.id}`;
      default:
        return `${item.type}-${index}`;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Progression",
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
        data={sections}
        keyExtractor={getItemKey}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          switch (item.type) {
            case "level":
              return (
                <View style={styles.section}>
                  <LevelProgressCard level={level!} />
                </View>
              );
            case "streak":
              return (
                <View style={styles.section}>
                  <StreakCard streak={streak!} />
                </View>
              );
            case "challenges-header":
              return (
                <View style={styles.sectionHeader}>
                  <SectionHeader
                    title={`Défis en cours (${activeChallenges.length})`}
                  />
                </View>
              );
            case "challenge":
              return (
                <View style={styles.section}>
                  <ChallengeRow challenge={activeChallenges[item.index]} />
                </View>
              );
            case "challenges-empty":
              return (
                <EmptyState
                  icon="Target"
                  title="Aucun défi actif"
                  description="De nouveaux défis seront disponibles bientôt"
                  containerStyle={styles.emptyCompact}
                />
              );
            case "completed-header":
              return (
                <View style={styles.sectionHeader}>
                  <SectionHeader
                    title={`Complétés (${completedChallenges.length})`}
                  />
                </View>
              );
            case "completed-challenge":
              return (
                <View style={styles.section}>
                  <ChallengeRow challenge={completedChallenges[item.index]} />
                </View>
              );
            case "badges-header":
              return (
                <View style={styles.sectionHeader}>
                  <SectionHeader
                    title={`Badges (${unlockedCount}/${totalCount})`}
                  />
                </View>
              );
            case "badges-grid":
              return (
                <View style={styles.section}>
                  <BadgeGrid badges={mergedBadges} />
                </View>
              );
            case "badges-empty":
              return (
                <EmptyState
                  icon="Award"
                  title="Aucun badge"
                  description="Continuez à jouer pour débloquer des badges"
                  containerStyle={styles.emptyCompact}
                />
              );
            case "loading":
              return (
                <View style={styles.section}>
                  <SkeletonRow showAvatar={false} lineCount={2} />
                </View>
              );
            default:
              return null;
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 6,
  },
  sectionHeader: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 20,
    paddingBottom: 4,
  },
  emptyCompact: {
    paddingVertical: 24,
  },
});
