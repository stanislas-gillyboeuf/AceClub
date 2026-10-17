import { useCallback, useMemo, useState } from "react";
import {
  View,
  Platform,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Text,
  TextInput,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { UserMinus } from "lucide-react-native";
import { useConversation } from "@/hooks/use-conversation";
import { useSearchUsers } from "@/hooks/use-user";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { conversationService } from "@/services/conversation";
import { queryKeys } from "@/lib/query-keys";
import type { UserSearchItem } from "@/types/user";

type ListEntry = { id: string; userId: string; name: string; image?: string | null };

export default function GroupMembersScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: conversation, isLoading, refetch } = useConversation(conversationId);
  const [searchText, setSearchText] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const isAdmin = conversation?.isAdmin ?? false;
  const memberIds = useMemo(
    () => new Set([currentUserId, ...(conversation?.otherParticipants.map((p) => p.user.id) ?? [])]),
    [conversation, currentUserId],
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversation.detail(conversationId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
  }, [queryClient, conversationId]);

  const handleRemove = useCallback(
    (entry: ListEntry) => {
      Alert.alert("Retirer du groupe", `Retirer ${entry.name} du groupe ?`, [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            setPendingUserId(entry.userId);
            try {
              await conversationService.removeGroupParticipant(conversationId, entry.userId);
              invalidate();
              refetch();
            } catch {
              Alert.alert("Erreur", "Impossible de retirer ce membre");
            } finally {
              setPendingUserId(null);
            }
          },
        },
      ]);
    },
    [conversationId, invalidate, refetch],
  );

  const handleAdd = useCallback(
    async (entry: ListEntry) => {
      setPendingUserId(entry.userId);
      try {
        await conversationService.addGroupParticipant(conversationId, entry.userId);
        setSearchText("");
        invalidate();
        refetch();
      } catch {
        Alert.alert("Erreur", "Impossible d'ajouter ce membre — vérifiez qu'il fait partie du club");
      } finally {
        setPendingUserId(null);
      }
    },
    [conversationId, invalidate, refetch],
  );

  const trimmedSearch = searchText.trim();
  const { data: searchData, isLoading: isSearching } = useSearchUsers(trimmedSearch, 20);
  const searchResults = useMemo<ListEntry[]>(() => {
    if (!searchData?.users) return [];
    return searchData.users
      .filter((u) => u.id !== currentUserId && !u.isGhost && !memberIds.has(u.id))
      .map<ListEntry>((u: UserSearchItem) => ({ id: u.id, userId: u.id, name: u.name, image: u.image }));
  }, [searchData, currentUserId, memberIds]);

  const members = useMemo<ListEntry[]>(() => {
    if (!conversation) return [];
    return conversation.otherParticipants.map((p) => ({
      id: p.id,
      userId: p.user.id,
      name: p.user.name,
      image: p.user.image,
    }));
  }, [conversation]);

  const renderMemberRow = useCallback(
    ({ item }: { item: ListEntry }) => (
      <View style={styles.memberRow}>
        <Avatar imageUrl={item.image} name={item.name} size={46} />
        <Text style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
          {item.name}
        </Text>
        {isAdmin &&
          (pendingUserId === item.userId ? (
            <ActivityIndicator color={semanticColors.labelSecondary[scheme]} />
          ) : (
            <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
              <UserMinus size={20} color={colorsRed(scheme)} />
            </Pressable>
          ))}
      </View>
    ),
    [isAdmin, pendingUserId, handleRemove, scheme],
  );

  const renderSearchRow = useCallback(
    ({ item }: { item: ListEntry }) => (
      <Pressable
        onPress={() => handleAdd(item)}
        disabled={pendingUserId === item.userId}
        style={({ pressed }) => [
          styles.memberRow,
          { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
        ]}
      >
        <Avatar imageUrl={item.image} name={item.name} size={46} />
        <Text style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
          {item.name}
        </Text>
        {pendingUserId === item.userId && <ActivityIndicator color={semanticColors.labelSecondary[scheme]} />}
      </Pressable>
    ),
    [handleAdd, pendingUserId, scheme],
  );

  const headerLeft = () => (
    <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
      {Platform.OS === "ios" ? (
        <Ionicons name="chevron-back" size={28} color={semanticColors.labelPrimary[scheme]} />
      ) : (
        <MaterialIcons name="arrow-back" size={24} color={semanticColors.labelPrimary[scheme]} />
      )}
    </Pressable>
  );

  if (isLoading || !conversation) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Membres", headerLeft }} />
        <ActivityIndicator color={semanticColors.accentGreen[scheme]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen options={{ title: "Membres", headerLargeTitle: true, headerLeft }} />

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberRow}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            {members.length + 1} membre{members.length > 0 ? "s" : ""}
          </Text>
        }
        ListFooterComponent={
          isAdmin ? (
            <View style={styles.addSection}>
              <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
                Ajouter des membres
              </Text>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Rechercher un membre du club"
                placeholderTextColor={semanticColors.labelSecondary[scheme]}
                style={[
                  styles.searchInput,
                  { color: semanticColors.labelPrimary[scheme], borderColor: semanticColors.divider[scheme] },
                ]}
              />
              {trimmedSearch.length >= 2 &&
                (isSearching ? (
                  <ActivityIndicator style={styles.searchLoader} color={semanticColors.accentGreen[scheme]} />
                ) : searchResults.length === 0 ? (
                  <EmptyState
                    icon="Users"
                    title="Aucun résultat"
                    description="Aucun membre du club ne correspond à votre recherche."
                    containerStyle={styles.emptyState}
                  />
                ) : (
                  searchResults.map((entry) => renderSearchRow({ item: entry }))
                ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

function colorsRed(scheme: "light" | "dark") {
  return scheme === "dark" ? "#FF6961" : "#FF3B30";
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
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: spacing.horizontal,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  addSection: {
    marginTop: 8,
  },
  searchInput: {
    marginHorizontal: spacing.horizontal,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  searchLoader: {
    marginTop: 16,
  },
  emptyState: {
    paddingVertical: 16,
  },
});
