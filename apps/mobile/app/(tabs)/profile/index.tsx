import { View, Text, ScrollView, Pressable } from "@/tw";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  ChevronRight,
  TrendingUp,
  Trophy,
  Calendar,
  Building2,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { usePreferences } from "@/hooks/useUser";
import { useMyLevel } from "@/hooks/useLevel";
import { useMyStreak } from "@/hooks/useStreak";
import { useMyBadges } from "@/hooks/useRewards";
import { useMyMatchIntents, useDeleteMatchIntent } from "@/hooks/useMatchIntents";
import { useUserOrganizations } from "@/hooks/useOrganizations";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LevelProgressCard } from "@/components/profile/LevelProgressCard";
import { StreakCard } from "@/components/profile/StreakCard";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MatchIntent } from "@/types/match-intent";

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const preferences = usePreferences();
  const level = useMyLevel();
  const streak = useMyStreak();
  const badges = useMyBadges();
  const matchIntents = useMyMatchIntents();
  const deleteIntent = useDeleteMatchIntent();
  const userOrgs = useUserOrganizations();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const handleDeleteIntent = useCallback(
    (id: string) => {
      deleteIntent.mutate(id);
    },
    [deleteIntent]
  );

  const intents: MatchIntent[] = matchIntents.data?.data ?? [];

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#34C759"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-horizontal py-2">
          <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
            Profil
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile/settings")}
            hitSlop={8}
          >
            <Settings size={22} color="#8E8E93" />
          </Pressable>
        </View>

        {/* Profile header card */}
        <View className="px-horizontal mt-2">
          <Card className="p-card">
            <View className="flex-row items-center gap-4">
              <Avatar
                imageUrl={user?.image}
                name={user?.name ?? "?"}
                size={64}
              />
              <View className="flex-1">
                <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark">
                  {user?.name}
                </Text>
                {preferences.data?.sport && (
                  <View className="flex-row items-center gap-2 mt-1">
                    <Badge variant="primary">
                      {preferences.data.sport === "tennis"
                        ? "Tennis"
                        : "Padel"}
                    </Badge>
                    {preferences.data.skillLevel && (
                      <Badge>{preferences.data.skillLevel}</Badge>
                    )}
                  </View>
                )}
                {preferences.data?.organizationName && (() => {
                  const orgSlug = userOrgs.data?.find(
                    (o) => o.id === preferences.data?.organizationId
                  )?.slug;
                  return (
                    <Pressable
                      onPress={() =>
                        orgSlug &&
                        router.push(`/(tabs)/profile/organization/${orgSlug}`)
                      }
                      disabled={!orgSlug}
                      className="flex-row items-center gap-1 mt-1"
                    >
                      <Building2 size={12} color="#8E8E93" />
                      <Text className="text-xs font-sans text-label-secondary">
                        {preferences.data.organizationName}
                      </Text>
                      {orgSlug && <ChevronRight size={12} color="#C7C7CC" />}
                    </Pressable>
                  );
                })()}
              </View>
            </View>

            {/* Badges row */}
            {badges.data && badges.data.length > 0 && (
              <View className="flex-row gap-2 mt-3 flex-wrap">
                {badges.data.slice(0, 5).map((badge) => (
                  <View
                    key={badge.id}
                    className="w-8 h-8 rounded-full overflow-hidden bg-bg-secondary dark:bg-bg-secondary-dark"
                  >
                    {badge.imageUrl && (
                      <View className="w-8 h-8">
                        <Avatar
                          imageUrl={badge.imageUrl}
                          name={badge.name}
                          size={32}
                        />
                      </View>
                    )}
                  </View>
                ))}
                {badges.data.length > 5 && (
                  <View className="w-8 h-8 rounded-full bg-bg-secondary dark:bg-bg-secondary-dark items-center justify-center">
                    <Text className="text-xs font-sans-medium text-label-secondary">
                      +{badges.data.length - 5}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </View>

        {/* Level progress */}
        <View className="px-horizontal mt-4">
          {level.data ? (
            <LevelProgressCard level={level.data} />
          ) : (
            <Card className="p-card">
              <Skeleton height={16} width="40%" />
              <Skeleton height={10} width="100%" className="mt-3" />
              <Skeleton height={12} width="60%" className="mt-2" />
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

        {/* Quick links */}
        <View className="px-horizontal mt-4 gap-2">
          <Pressable
            onPress={() => router.push("/(tabs)/profile/progression")}
          >
            <Card className="p-card flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-md bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
                  <TrendingUp size={18} color="#34C759" />
                </View>
                <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                  Progression
                </Text>
              </View>
              <ChevronRight size={18} color="#8E8E93" />
            </Card>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/profile/leaderboard")}
          >
            <Card className="p-card flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-md bg-accent-orange/10 items-center justify-center">
                  <Trophy size={18} color="#FF9500" />
                </View>
                <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                  Classement
                </Text>
              </View>
              <ChevronRight size={18} color="#8E8E93" />
            </Card>
          </Pressable>
        </View>

        {/* Match Intents */}
        <View className="px-horizontal mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
              Mes disponibilités
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/discover")}
              hitSlop={8}
              className="flex-row items-center gap-1"
            >
              <Plus size={16} color="#34C759" />
              <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                Créer
              </Text>
            </Pressable>
          </View>

          {matchIntents.isLoading ? (
            <View className="gap-2">
              <Skeleton height={60} width="100%" />
              <Skeleton height={60} width="100%" />
            </View>
          ) : intents.length === 0 ? (
            <Card className="p-card items-center py-6">
              <Calendar size={32} color="#8E8E93" strokeWidth={1.5} />
              <Text className="text-sm font-sans text-label-secondary mt-2 text-center">
                Aucune disponibilité publiée.{"\n"}Créez-en une pour trouver
                des partenaires.
              </Text>
            </Card>
          ) : (
            <View className="gap-2">
              {intents.map((intent) => (
                <Card key={intent.id} className="p-card">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Badge variant={intent.type === "match" ? "primary" : "orange"}>
                        {intent.type === "match" ? "Match" : "Entraînement"}
                      </Badge>
                      {intent.date && (
                        <Text className="text-sm font-sans text-label-secondary">
                          {new Date(intent.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                          {intent.time ? ` ${intent.time}` : ""}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleDeleteIntent(intent.id)}
                      hitSlop={8}
                      disabled={deleteIntent.isPending}
                    >
                      <Trash2 size={16} color="#FF3B30" />
                    </Pressable>
                  </View>
                  {intent.description && (
                    <Text
                      className="text-sm font-sans text-label-primary dark:text-label-primary-dark mt-1"
                      numberOfLines={2}
                    >
                      {intent.description}
                    </Text>
                  )}
                  <Text className="text-xs font-sans text-label-secondary mt-1">
                    {intent.duration} min
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
