import { useEffect, useCallback, useState } from "react";
import {
  View,
  Platform,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useConversations, useDeleteConversation } from "@/hooks/use-conversation";
import { queryKeys } from "@/lib/query-keys";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationRow } from "@/features/chat/components/ConversationRow";
import { wsManager } from "@/lib/websocket-manager";
import { SquarePen } from "lucide-react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { GlassView } from "@/components/ui/glass-view";
import type { Conversation } from "@/types/conversation";

function RightActions({
  prog,
  drag,
  onDelete,
}: {
  prog: SharedValue<number>;
  drag: SharedValue<number>;
  onDelete: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 80 }],
  }));

  return (
    <Animated.View style={[styles.swipeActions, animatedStyle]}>
      <Pressable onPress={onDelete} style={styles.swipeDeleteBtn}>
        <Text style={styles.swipeActionText}>Supprimer</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ConversationListScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading, refetch } = useConversations();
  const deleteConversation = useDeleteConversation();
  const [searchText, setSearchText] = useState("");

  // Connect WebSocket on mount
  useEffect(() => {
    wsManager.connect();

    const unsubscribe = wsManager.subscribe((event) => {
      if (event.type === "reconnected") {
        refetch();
      }
      if (event.type === "newMessage") {
        queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
      }
    });

    return unsubscribe;
  }, [refetch, queryClient]);

  const handlePress = useCallback(
    (conversation: Conversation) => {
      router.push(`/conversation/${conversation.id}`);
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
    Alert.alert("Nouveau", undefined, [
      { text: "Discussion", onPress: () => router.push("/chat/new") },
      { text: "Groupe", onPress: () => router.push("/chat/new-group") },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [router]);

  const filteredConversations = conversations
    ?.filter((c) => {
      if (!searchText.trim()) return true;
      const query = searchText.toLowerCase();
      const name = c.name || c.otherParticipants[0]?.user?.name || "";
      return name.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      // Pending requests surface first so they don't get lost in the list.
      const aPending = a.status === "pending_request" ? 1 : 0;
      const bPending = b.status === "pending_request" ? 1 : 0;
      return bPending - aPending;
    });

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={(prog, drag) => (
          <RightActions prog={prog} drag={drag} onDelete={() => handleDelete(item)} />
        )}
      >
        <Pressable onPress={() => handlePress(item)} style={styles.rowWrapper}>
          <GlassView style={styles.glassRow} isInteractive>
            <ConversationRow conversation={item} />
          </GlassView>
        </Pressable>
      </ReanimatedSwipeable>
    ),
    [handlePress, handleDelete],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const headerRight = useCallback(
    () => (
      <Pressable onPress={handleNewConversation}>
        <SquarePen size={22} color={semanticColors.accentGreen[scheme]} />
      </Pressable>
    ),
    [handleNewConversation, scheme],
  );

  // Pushed from Feed/Matchs/Rechercher onto the root stack rather than a tab's own stack, so
  // there's no previous screen in THIS stack for the navigator to auto-show a back button for.
  const headerLeft = useCallback(
    () => (
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
        {Platform.OS === "ios" ? (
          <Ionicons name="chevron-back" size={28} color={semanticColors.accentGreen[scheme]} />
        ) : (
          <MaterialIcons name="arrow-back" size={24} color={semanticColors.accentGreen[scheme]} />
        )}
      </Pressable>
    ),
    [router, scheme],
  );

  if (isLoading && !conversations) {
    return (
      <View style={[styles.centered, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <Stack.Screen
          options={{
            title: "Messages",
            headerLargeTitle: true,
            headerLeft,
            headerRight,
          }}
        />
        <ActivityIndicator color={semanticColors.accentGreen[scheme]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen
        options={{
          title: "Messages",
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: "Rechercher",
            onChangeText: (e) => setSearchText(e.nativeEvent.text),
            hideWhenScrolling: true,
          },
          headerLeft,
          headerRight,
        }}
      />
      {!filteredConversations || filteredConversations.length === 0 ? (
        <EmptyState
          icon="MessageSquare"
          title="Aucune conversation"
          description="Démarrez une conversation avec un membre de votre club en appuyant sur le bouton en haut à droite."
          containerStyle={styles.emptyState}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={semanticColors.accentGreen[scheme]}
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
  backButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  rowWrapper: {},
  glassRow: {
    borderRadius: 16,
    overflow: "hidden",
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
  },
  swipeActions: {
    width: 80,
    flexDirection: "row",
  },
  swipeDeleteBtn: {
    flex: 1,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
