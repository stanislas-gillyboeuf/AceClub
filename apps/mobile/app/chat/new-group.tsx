import { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Text,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Check, X } from "lucide-react-native";
import { useSearchUsers } from "@/hooks/use-user";
import { useActiveClub } from "@/hooks/use-active-club";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { conversationService } from "@/services/conversation";
import type { UserSearchItem } from "@/types/user";

type ListEntry = {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
};

export default function NewGroupScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { activeClubId } = useActiveClub();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";
  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const toggleSelected = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!activeClubId || !groupName.trim() || selectedIds.size === 0) return;
    setIsCreating(true);
    try {
      const result = await conversationService.createGroup(activeClubId, groupName.trim(), [
        ...selectedIds,
      ]);
      router.replace(`/conversation/${result.conversationId}`);
    } catch {
      Alert.alert("Erreur", "Impossible de créer le groupe — vérifiez que chaque membre fait partie du club");
    } finally {
      setIsCreating(false);
    }
  }, [activeClubId, groupName, selectedIds, router]);

  const canCreate = !!groupName.trim() && selectedIds.size > 0 && !isCreating;

  const renderItem = useCallback(
    ({ item }: { item: ListEntry }) => {
      const isSelected = selectedIds.has(item.userId);
      return (
        <Pressable
          onPress={() => toggleSelected(item.userId)}
          style={({ pressed }) => [
            styles.memberRow,
            { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
          ]}
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
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected
                  ? semanticColors.accentGreen[scheme]
                  : semanticColors.labelSecondary[scheme],
                backgroundColor: isSelected ? semanticColors.accentGreen[scheme] : "transparent",
              },
            ]}
          >
            {isSelected && <Check size={14} color={semanticColors.onAccentGreen[scheme]} strokeWidth={3} />}
          </View>
        </Pressable>
      );
    },
    [toggleSelected, selectedIds, scheme],
  );

  const renderSeparator = useCallback(
    () => <View style={[styles.separator, { backgroundColor: semanticColors.divider[scheme] }]} />,
    [scheme],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nouveau groupe",
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()}>
              <X size={20} color={semanticColors.accentGreen[scheme]} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleCreate} disabled={!canCreate}>
              <Text
                style={[
                  styles.createLabel,
                  { color: canCreate ? semanticColors.accentGreen[scheme] : semanticColors.labelSecondary[scheme] },
                ]}
              >
                Créer
              </Text>
            </Pressable>
          ),
        }}
      />

      {isCreating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}

      <View style={[styles.nameField, { borderColor: semanticColors.divider[scheme] }]}>
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Nom du groupe"
          placeholderTextColor={semanticColors.labelSecondary[scheme]}
          style={[styles.nameInput, { color: semanticColors.labelPrimary[scheme] }]}
        />
      </View>

      <FlatList
        style={[styles.list, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.searchField}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Rechercher un membre"
              placeholderTextColor={semanticColors.labelSecondary[scheme]}
              style={[styles.searchInput, { color: semanticColors.labelPrimary[scheme] }]}
            />
          </View>
        }
        ListEmptyComponent={
          showSearchHint ? (
            <EmptyState
              icon="Search"
              title="Rechercher un membre"
              description="Tapez au moins 2 caractères pour rechercher."
              containerStyle={styles.emptyState}
            />
          ) : isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={semanticColors.accentGreen[scheme]} />
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
  nameField: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nameInput: {
    fontSize: 17,
    fontWeight: "600",
  },
  searchField: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 15,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 84,
  },
  emptyState: {
    flex: 1,
  },
  createLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});
