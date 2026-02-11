import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "@/tw";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Award, Target } from "lucide-react-native";
import { useMyLevel, useAcesHistory } from "@/hooks/useLevel";
import { useMyStreak } from "@/hooks/useStreak";
import { useActiveChallenges } from "@/hooks/useChallenges";
import { useAllBadges } from "@/hooks/useRewards";
import { LevelProgressCard } from "@/components/profile/LevelProgressCard";
import { StreakCard } from "@/components/profile/StreakCard";
import { ChallengeRow } from "@/components/profile/ChallengeRow";
import { BadgeGrid } from "@/components/profile/BadgeGrid";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AcesTransaction } from "@/types/level";

export default function ProgressionScreen() {
  const router = useRouter();
  const level = useMyLevel();
  const streak = useMyStreak();
  const challenges = useActiveChallenges();
  const badges = useAllBadges();
  const history = useAcesHistory();

  const allTransactions = useMemo(() => {
    return history.data?.pages.flatMap((p) => p.transactions) ?? [];
  }, [history.data]);

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
        <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
          Progression
        </Text>
        <View className="w-16" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Level */}
        <View className="px-horizontal mt-4">
          {level.data ? (
            <LevelProgressCard level={level.data} />
          ) : (
            <Card className="p-card">
              <Skeleton height={16} width="40%" />
              <Skeleton height={10} width="100%" className="mt-3" />
            </Card>
          )}
        </View>

        {/* Streak */}
        <View className="px-horizontal mt-4">
          {streak.data ? (
            <StreakCard streak={streak.data} />
          ) : (
            <Card className="p-card">
              <Skeleton height={16} width="50%" />
              <View className="flex-row gap-3 mt-3">
                <Skeleton height={80} width="32%" />
                <Skeleton height={80} width="32%" />
                <Skeleton height={80} width="32%" />
              </View>
            </Card>
          )}
        </View>

        {/* Active Challenges */}
        <View className="px-horizontal mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Target size={18} color="#34C759" />
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
              Défis actifs
            </Text>
          </View>

          {challenges.isLoading ? (
            <Card className="p-card">
              <Skeleton height={50} width="100%" />
              <Skeleton height={50} width="100%" className="mt-2" />
            </Card>
          ) : challenges.data && challenges.data.length > 0 ? (
            <Card className="px-card">
              {challenges.data.map((challenge, index) => (
                <View key={challenge.id}>
                  <ChallengeRow challenge={challenge} />
                  {index < challenges.data!.length - 1 && (
                    <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50" />
                  )}
                </View>
              ))}
            </Card>
          ) : (
            <Card className="p-card items-center py-6">
              <Target size={32} color="#8E8E93" strokeWidth={1.5} />
              <Text className="text-sm font-sans text-label-secondary mt-2 text-center">
                Aucun défi actif pour le moment.
              </Text>
            </Card>
          )}
        </View>

        {/* Badges */}
        <View className="px-horizontal mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Award size={18} color="#FF9500" />
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
              Badges
            </Text>
          </View>

          {badges.isLoading ? (
            <View className="flex-row gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={56} width={56} borderRadius={28} />
              ))}
            </View>
          ) : badges.data && badges.data.length > 0 ? (
            <BadgeGrid badges={badges.data} />
          ) : (
            <Card className="p-card items-center py-6">
              <Award size={32} color="#8E8E93" strokeWidth={1.5} />
              <Text className="text-sm font-sans text-label-secondary mt-2 text-center">
                Jouez des matchs pour débloquer des badges.
              </Text>
            </Card>
          )}
        </View>

        {/* Aces History */}
        <View className="px-horizontal mt-6">
          <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark mb-3">
            Historique des Aces
          </Text>

          {history.isLoading ? (
            <Card className="p-card">
              <Skeleton height={40} width="100%" />
              <Skeleton height={40} width="100%" className="mt-2" />
              <Skeleton height={40} width="100%" className="mt-2" />
            </Card>
          ) : allTransactions.length > 0 ? (
            <Card className="px-card">
              {allTransactions.map((tx: AcesTransaction, index: number) => (
                <View key={tx.id}>
                  <View className="flex-row items-center justify-between py-3">
                    <View className="flex-1">
                      <Text className="text-sm font-sans-medium text-label-primary dark:text-label-primary-dark">
                        {formatTransactionType(tx.type)}
                      </Text>
                      {tx.description && (
                        <Text
                          className="text-xs font-sans text-label-secondary mt-0.5"
                          numberOfLines={1}
                        >
                          {tx.description}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-sans-bold text-primary dark:text-primary-dark">
                        +{tx.amount}
                      </Text>
                      {tx.multiplier > 1 && (
                        <Text className="text-[10px] font-sans text-accent-orange">
                          x{tx.multiplier}
                        </Text>
                      )}
                    </View>
                  </View>
                  {index < allTransactions.length - 1 && (
                    <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50" />
                  )}
                </View>
              ))}

              {history.hasNextPage && (
                <Pressable
                  onPress={() => history.fetchNextPage()}
                  disabled={history.isFetchingNextPage}
                  className="py-3 items-center"
                >
                  {history.isFetchingNextPage ? (
                    <ActivityIndicator size="small" color="#34C759" />
                  ) : (
                    <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                      Voir plus
                    </Text>
                  )}
                </Pressable>
              )}
            </Card>
          ) : (
            <Card className="p-card items-center py-6">
              <Text className="text-sm font-sans text-label-secondary text-center">
                Aucun historique pour le moment.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTransactionType(type: string): string {
  switch (type) {
    case "match_participation":
      return "Participation match";
    case "match_victory":
      return "Victoire";
    case "challenge_completed":
      return "Défi complété";
    case "streak_bonus":
      return "Bonus série";
    case "level_up_bonus":
      return "Bonus niveau";
    case "badge_bonus":
      return "Bonus badge";
    default:
      return type;
  }
}
