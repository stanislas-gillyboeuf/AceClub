import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
} from "@/tw";
import {
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Trophy } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { usePreferences } from "@/hooks/useUser";
import {
  useGlobalLeaderboard,
  useWeeklyLeaderboard,
  useOrganizationLeaderboard,
} from "@/hooks/useLeaderboard";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LeaderboardEntry, WeeklyLeaderboardEntry } from "@/types/leaderboard";

type LeaderboardTab = "global" | "weekly" | "club";

export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id;
  const preferences = usePreferences();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>("global");

  const global = useGlobalLeaderboard();
  const weekly = useWeeklyLeaderboard();
  const orgId = preferences.data?.organizationId ?? "";
  const organization = useOrganizationLeaderboard(orgId);

  const tabs: { key: LeaderboardTab; label: string }[] = [
    { key: "global", label: "Global" },
    { key: "weekly", label: "Hebdo" },
    ...(orgId ? [{ key: "club" as LeaderboardTab, label: "Club" }] : []),
  ];

  const globalEntries = useMemo(
    () => global.data?.pages.flatMap((p) => p.leaderboard) ?? [],
    [global.data]
  );

  const weeklyEntries = useMemo(
    () => weekly.data?.pages.flatMap((p) => p.leaderboard) ?? [],
    [weekly.data]
  );

  const orgEntries = useMemo(
    () => organization.data?.pages.flatMap((p) => p.leaderboard) ?? [],
    [organization.data]
  );

  const activeData = activeTab === "global"
    ? global
    : activeTab === "weekly"
    ? weekly
    : organization;

  const activeEntries: (LeaderboardEntry | WeeklyLeaderboardEntry)[] =
    activeTab === "global"
      ? globalEntries
      : activeTab === "weekly"
      ? weeklyEntries
      : orgEntries;

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
          Classement
        </Text>
        <View className="w-16" />
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-horizontal mt-2 bg-bg-secondary dark:bg-bg-secondary-dark rounded-md p-1">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-sm items-center ${
              activeTab === tab.key
                ? "bg-bg-card dark:bg-bg-card-dark"
                : ""
            }`}
          >
            <Text
              className={`text-sm font-sans-medium ${
                activeTab === tab.key
                  ? "text-label-primary dark:text-label-primary-dark"
                  : "text-label-secondary"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Weekly date indicator */}
      {activeTab === "weekly" && weekly.data?.pages[0]?.weekStartDate && (
        <View className="px-horizontal mt-2">
          <Text className="text-xs font-sans text-label-secondary text-center">
            Semaine du{" "}
            {new Date(
              weekly.data.pages[0].weekStartDate
            ).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>
      )}

      {/* Content */}
      {activeData.isLoading ? (
        <View className="px-horizontal pt-4 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Skeleton height={20} width={30} />
              <Skeleton height={40} width={40} borderRadius={20} />
              <View className="flex-1 gap-1">
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="30%" />
              </View>
              <Skeleton height={20} width={50} />
            </View>
          ))}
        </View>
      ) : activeEntries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Aucun classement"
          description="Les joueurs apparaîtront ici une fois qu'ils auront gagné des Aces."
        />
      ) : (
        <FlatList
          data={activeEntries}
          keyExtractor={(item) => `${item.rank}-${item.user.id}`}
          renderItem={({ item }) => (
            <LeaderboardRow
              entry={item}
              currentUserId={currentUserId}
              variant={activeTab === "weekly" ? "weekly" : "global"}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50 ml-[88px] mr-horizontal" />
          )}
          onEndReached={() => {
            if (activeData.hasNextPage && !activeData.isFetchingNextPage) {
              activeData.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            activeData.isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#34C759" />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
