import { useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing } from "@/constants/theme";
import { useMatchRequests, useAcceptRequest, useRejectRequest } from "@/hooks/use-match-intent";
import { MatchRequestRow } from "@/features/match-intent/components/match-request-row";
import { MatchRequestSkeleton } from "@/features/match-intent/components/match-request-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { MatchRequestWithDetails } from "@/types/match-intent";

export default function MatchRequests() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { data: requests, isLoading, refetch, isRefetching } = useMatchRequests();
  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();

  const pendingRequests = (requests ?? []).filter(
    (r) => r.status === "pending"
  );

  const handleAccept = useCallback(
    async (item: MatchRequestWithDetails) => {
      try {
        const result = await acceptMutation.mutateAsync(item.id);

        if (result.conversationId) {
          // Dismiss the modal first, then navigate to chat
          router.dismiss();
          // Small delay to allow modal dismiss animation before navigating
          setTimeout(() => {
            router.push(`/(tabs)/chat`);
          }, 300);
        } else {
          router.dismiss();
        }
      } catch {
        Alert.alert("Erreur", "Impossible d'accepter la demande. Reessaye.");
      }
    },
    [acceptMutation, router]
  );

  const handleReject = useCallback(
    async (item: MatchRequestWithDetails) => {
      try {
        await rejectMutation.mutateAsync(item.id);
      } catch {
        Alert.alert("Erreur", "Impossible de refuser la demande. Reessaye.");
      }
    },
    [rejectMutation]
  );

  const renderItem = useCallback(
    ({ item }: { item: MatchRequestWithDetails }) => (
      <MatchRequestRow
        item={item}
        onAccept={() => handleAccept(item)}
        onReject={() => handleReject(item)}
      />
    ),
    [handleAccept, handleReject]
  );

  // Loading state
  if (isLoading && pendingRequests.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: "Demandes de match" }} />
        <View
          style={[
            styles.container,
            { backgroundColor: semanticColors.primaryBackground[scheme] },
          ]}
        >
          <View style={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <MatchRequestSkeleton key={i} />
            ))}
          </View>
        </View>
      </>
    );
  }

  // Empty state
  if (!isLoading && pendingRequests.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: "Demandes de match" }} />
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: semanticColors.primaryBackground[scheme] },
          ]}
        >
          <EmptyState
            icon="MailOpen"
            title="Aucune demande en attente"
            description="Quand quelqu'un like ton intent de match, tu verras la demande ici."
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Demandes de match" }} />
      <FlatList
        data={pendingRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonList: {
    padding: spacing.horizontal,
    paddingTop: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: spacing.horizontal,
    paddingBottom: 32,
  },
});
