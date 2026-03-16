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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, X } from "lucide-react-native";
import { conversationService } from "@/services/conversation";
import type { UserSearchItem } from "@/types/user";

export default function NewConversationScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText);
  const [isCreating, setIsCreating] = useState(false);

  const { data: searchData, isLoading } = useSearchUsers(debouncedSearch, 15);

  const users = useMemo(() => {
    if (!searchData?.users) return [];
    return searchData.users.filter(
      (u) => u.id !== currentUserId && !u.isGhost,
    );
  }, [searchData, currentUserId]);

  const handleSelectUser = useCallback(
    async (user: UserSearchItem) => {
      setIsCreating(true);
      try {
        const result = await conversationService.findOrCreateConversation(user.id);
        router.replace(`/conversation/${result.conversationId}`);
      } catch {
        Alert.alert("Erreur", "Impossible de créer la conversation");
      } finally {
        setIsCreating(false);
      }
    },
    [router],
  );

  const renderUser = useCallback(
    ({ item }: { item: UserSearchItem }) => {
      return (
        <Pressable
          onPress={() => handleSelectUser(item)}
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
      );
    },
    [handleSelectUser, scheme, isCreating],
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
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ItemSeparatorComponent={renderSeparator}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.accentGreen} />
            </View>
          ) : (
            <EmptyState
              icon="Users"
              title={searchText ? "Aucun résultat" : "Rechercher"}
              description={
                searchText
                  ? "Aucun utilisateur ne correspond à votre recherche."
                  : "Tapez un nom pour trouver un utilisateur."
              }
              containerStyle={styles.emptyState}
            />
          )
        }
      />
    </>
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
    paddingVertical: 32,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    marginLeft: 80,
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
