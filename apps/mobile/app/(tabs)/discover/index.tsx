import { useCallback } from "react";
import {
  View,
  Platform,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { PartnerRequestCard } from "@/features/discover/components/PartnerRequestCard";
import { DiscoverFilters } from "@/features/discover/components/DiscoverFilters";
import { useDiscoverList } from "@/features/discover/hooks/use-discover-list";
import { EmptyState } from "@/components/ui/empty-state";
import { JoinClubPrompt } from "@/components/ui/join-club-prompt";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MatchIntentWithUser } from "@/types/match-intent";
import { MessagesHeaderButton } from "@/features/chat/components/MessagesHeaderButton";
import { useUnreadMessagesCount } from "@/hooks/use-conversation";

export default function DiscoverScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const totalUnread = useUnreadMessagesCount();
  const {
    items,
    sport,
    changeSport,
    selectedLevels,
    toggleLevel,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasMore,
    loadMore,
    hasClub,
    refresh,
  } = useDiscoverList();

  const renderItem = useCallback(
    ({ item }: { item: MatchIntentWithUser }) => (
      <View style={styles.cardWrapper}>
        <PartnerRequestCard item={item} />
      </View>
    ),
    []
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Trouver un partenaire",
          headerLargeTitle: true,
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <View style={styles.androidHeaderRight}>
                    <MessagesHeaderButton />
                  </View>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button onPress={() => router.push("/chat")} tintColor={colors.accentGreen}>
            <Stack.Toolbar.Icon sf="message" />
            {totalUnread > 0 && (
              <Stack.Toolbar.Badge>{totalUnread > 99 ? "99+" : String(totalUnread)}</Stack.Toolbar.Badge>
            )}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      )}
      <FlatList
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentContainerStyle={styles.listContent}
        data={hasClub ? items : []}
        keyExtractor={(item) => item.intent.id}
        renderItem={renderItem}
        ListHeaderComponent={
          hasClub ? (
            <DiscoverFilters
              sport={sport}
              onSportChange={changeSport}
              selectedLevels={selectedLevels}
              onToggleLevel={toggleLevel}
            />
          ) : null
        }
        ListEmptyComponent={
          !hasClub ? (
            <JoinClubPrompt />
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accentGreen} />
            </View>
          ) : (
            <EmptyState
              icon="UsersRound"
              title="Aucune recherche pour l'instant"
              description="Reviens plus tard ou crée ta propre recherche de partenaire."
            />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        contentInsetAdjustmentBehavior="automatic"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  androidHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    // spacing handled by ItemSeparatorComponent
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
});
