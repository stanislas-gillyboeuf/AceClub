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
import { useMembers, useMyOrganizations } from "@/hooks/use-organization";
import { useSearchUsers } from "@/hooks/use-user";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, X } from "lucide-react-native";
import { conversationService } from "@/services/conversation";
import type { UserSearchItem } from "@/types/user";

type Scope = "club" | "all";

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "club", label: "Mon club" },
  { value: "all", label: "Tous" },
];

type ListEntry = {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
  subtitle: string;
};

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "owner":
      return "Propriétaire";
    case "admin":
      return "Administrateur";
    default:
      return "Membre";
  }
}

export default function NewConversationScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";
  const { data: orgs } = useMyOrganizations();
  const orgId = orgs?.[0]?.id ?? "";
  const { data: membersData, isLoading: isLoadingMembers } = useMembers(orgId);
  const [searchText, setSearchText] = useState("");
  const [scope, setScope] = useState<Scope>("club");
  const [isCreating, setIsCreating] = useState(false);

  const { data: globalSearchData, isLoading: isLoadingGlobal } = useSearchUsers(
    scope === "all" ? searchText.trim() : "",
    20,
  );

  const clubEntries = useMemo<ListEntry[]>(() => {
    if (!membersData?.members) return [];
    const members = membersData.members.filter(
      (m) => m.userId !== currentUserId && m.user != null && m.role !== "owner",
    );
    const query = searchText.trim().toLowerCase();
    const filtered = query
      ? members.filter((m) => m.user?.name?.toLowerCase().includes(query))
      : members;
    return filtered.map<ListEntry>((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user!.name,
      image: m.user!.image,
      subtitle: getRoleDisplayName(m.role),
    }));
  }, [membersData, currentUserId, searchText]);

  const allEntries = useMemo<ListEntry[]>(() => {
    if (!globalSearchData?.users) return [];
    return globalSearchData.users
      .filter((u) => u.id !== currentUserId && !u.isGhost)
      .map<ListEntry>((u: UserSearchItem) => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        image: u.image,
        subtitle: "Utilisateur",
      }));
  }, [globalSearchData, currentUserId]);

  const entries = scope === "club" ? clubEntries : allEntries;
  const isLoading = scope === "club" ? isLoadingMembers : isLoadingGlobal;
  const trimmedSearch = searchText.trim();
  const showGlobalHint =
    scope === "all" && trimmedSearch.length < 2 && allEntries.length === 0;

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
          <Text
            style={[styles.memberRole, { color: semanticColors.labelSecondary[scheme] }]}
            numberOfLines={1}
          >
            {item.subtitle}
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

  const emptyDescription = useMemo(() => {
    if (scope === "all") {
      if (trimmedSearch.length < 2) {
        return "Tapez au moins 2 caractères pour rechercher un utilisateur.";
      }
      return "Aucun utilisateur ne correspond à votre recherche.";
    }
    return searchText
      ? "Aucun membre ne correspond à votre recherche."
      : "Aucun membre disponible pour démarrer une conversation.";
  }, [scope, trimmedSearch, searchText]);

  const searchPlaceholder =
    scope === "all" ? "Rechercher un utilisateur" : "Rechercher un membre";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nouveau message",
          headerSearchBarOptions: {
            placeholder: searchPlaceholder,
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

      <View
        style={[
          styles.container,
          { backgroundColor: semanticColors.primaryBackground[scheme] },
        ]}
      >
        <View style={styles.scopeContainer}>
          <SegmentedControl
            options={SCOPE_OPTIONS}
            selected={scope}
            onSelect={setScope}
          />
        </View>

        <FlatList
          style={styles.list}
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
                icon={showGlobalHint ? "Search" : "Users"}
                title={
                  showGlobalHint ? "Rechercher un utilisateur" : "Aucun résultat"
                }
                description={emptyDescription}
                containerStyle={styles.emptyState}
              />
            )
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  scopeContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
  memberRole: {
    fontSize: 15,
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
