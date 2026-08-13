import { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSearchUsers } from "@/hooks/use-user";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, X } from "lucide-react-native";
import { conversationService } from "@/services/conversation";
import type { UserSearchItem } from "@/types/user";

type ListEntry = {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
};

export default function NewConversationScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const trimmedSearch = searchText.trim();
  const { data: searchData, isLoading } = useSearchUsers(trimmedSearch, 20);

  const entries = useMemo<ListEntry[]>(() => {
    if (!searchData?.users) return [];
    return searchData.users
      .filter((u) => u.id !== currentUserId && !u.isGhost)
      .map<ListEntry>((u: UserSearchItem) => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        image: u.image,
      }));
  }, [searchData, currentUserId]);

  const showSearchHint = trimmedSearch.length < 2;

  const handleSelect = useCallback(
    async (entry: ListEntry) => {
      setIsCreating(true);
      try {
        const result = await conversationService.findOrCreateConversation(entry.userId);
        router.replace(`/conversation/${result.conversationId}`);
      } catch {
        Alert.alert("Erreur", "Impossible de créer la conversation");
      } finally {
        setIsCreating(false);
      }
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListEntry }) => (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.memberRow,
          { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
        ]}
        disabled={isCreating}
      >
        <Avatar imageUrl={item.image} name={item.name} size={50} />
        <View style={styles.memberInfo}>
          <Text
            style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <ChevronRight size={16} color={semanticColors.labelSecondary[scheme]} />
      </Pressable>
    ),
    [handleSelect, scheme, isCreating],
  );

  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: semanticColors.divider[scheme] }]}
      />
    ),
    [scheme],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nouveau message",
          headerSearchBarOptions: {
            placeholder: "Rechercher un utilisateur",
            onChangeText: (e) => setSearchText(e.nativeEvent.text),
          },
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()}>
              <X size={20} color={colors.accentGreen} />
            </Pressable>
          ),
        }}
      />

      {isCreating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}

      <FlatList
        style={[
          styles.list,
          { backgroundColor: semanticColors.primaryBackground[scheme] },
        ]}
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          showSearchHint ? (
            <EmptyState
              icon="Search"
              title="Rechercher un utilisateur"
              description="Tapez au moins 2 caractères pour rechercher."
              containerStyle={styles.emptyState}
            />
          ) : isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.accentGreen} />
            </View>
          ) : (
            <EmptyState
              icon="Users"
              title="Aucun résultat"
              description="Aucun utilisateur ne correspond à votre recherche."
              containerStyle={styles.emptyState}
            />
          )
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.horizontal,
    gap: 14,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 84,
  },
  emptyState: {
    flex: 1,
  },
  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});
