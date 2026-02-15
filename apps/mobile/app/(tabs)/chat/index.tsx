import { useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useConversations, useDeleteConversation } from "@/hooks/use-conversation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationRow } from "@/features/chat/components/ConversationRow";
import { wsManager } from "@/lib/websocket-manager";
import { Plus } from "lucide-react-native";
import type { Conversation } from "@/types/conversation";

export default function ConversationListScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading, refetch } = useConversations();
  const deleteConversation = useDeleteConversation();

  // Connect WebSocket on mount
  useEffect(() => {
    wsManager.connect();

    const unsubscribe = wsManager.subscribe((event) => {
      if (event.type === "reconnected") {
        refetch();
      }
      if (event.type === "newMessage") {
        queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
      }
    });

    return unsubscribe;
  }, [refetch, queryClient]);

  const handlePress = useCallback(
    (conversation: Conversation) => {
      router.push(`/(tabs)/chat/${conversation.id}`);
    },
    [router],
  );

  const handleDelete = useCallback(
    (conversation: Conversation) => {
      Alert.alert(
        "Supprimer la conversation",
        "Êtes-vous sûr de vouloir supprimer cette conversation ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => deleteConversation.mutate(conversation.id),
          },
        ],
      );
    },
    [deleteConversation],
  );

  const handleNewConversation = useCallback(() => {
    router.push("/(tabs)/chat/new");
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <Pressable
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item)}
        style={({ pressed }) => [
          styles.rowWrapper,
          { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
        ]}
      >
        <ConversationRow conversation={item} />
      </Pressable>
    ),
    [handlePress, handleDelete, scheme],
  );

  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: semanticColors.divider[scheme] }]}
      />
    ),
    [scheme],
  );

  if (isLoading && !conversations) {
    return (
      <View style={[styles.centered, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <Stack.Screen
          options={{
            title: "Messages",
            headerLargeTitle: true,
            headerRight: () => (
              <Pressable onPress={handleNewConversation}>
                <Plus size={22} color={colors.accentGreen} />
              </Pressable>
            ),
          }}
        />
        <ActivityIndicator color={colors.accentGreen} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen
        options={{
          title: "Messages",
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={handleNewConversation}>
              <Plus size={22} color={colors.accentGreen} />
            </Pressable>
          ),
        }}
      />
      {!conversations || conversations.length === 0 ? (
        <EmptyState
          icon="MessageSquare"
          title="Aucune conversation"
          description="Démarrez une conversation avec un membre de votre club en appuyant sur +."
          containerStyle={styles.emptyState}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.accentGreen}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  rowWrapper: {
    borderRadius: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 84,
  },
  emptyState: {
    flex: 1,
  },
});
