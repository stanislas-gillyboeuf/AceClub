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
import { X } from "lucide-react-native";
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
  const [selected, setSelected] = useState<ListEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const trimmedSearch = searchText.trim();
  const { data: searchData, isLoading } = useSearchUsers(trimmedSearch, 20);
  const selectedIds = useMemo(() => new Set(selected.map((s) => s.userId)), [selected]);

  const entries = useMemo<ListEntry[]>(() => {
    if (!searchData?.users) return [];
    return searchData.users
      .filter((u) => u.id !== currentUserId && !u.isGhost && !selectedIds.has(u.id))
      .map<ListEntry>((u: UserSearchItem) => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        image: u.image,
      }));
  }, [searchData, currentUserId, selectedIds]);

  const showSearchHint = trimmedSearch.length < 2;

  const handleAdd = useCallback((entry: ListEntry) => {
    setSelected((prev) => [...prev, entry]);
    setSearchText("");
  }, []);

  const handleRemove = useCallback((userId: string) => {
    setSelected((prev) => prev.filter((s) => s.userId !== userId));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!activeClubId || !groupName.trim() || selected.length === 0) return;
    setIsCreating(true);
    try {
      const result = await conversationService.createGroup(
        activeClubId,
        groupName.trim(),
        selected.map((s) => s.userId),
      );
      router.replace(`/conversation/${result.conversationId}`);
    } catch {
      Alert.alert("Erreur", "Impossible de créer le groupe — vérifiez que chaque membre fait partie du club");
    } finally {
      setIsCreating(false);
    }
  }, [activeClubId, groupName, selected, router]);

  const renderSelectedChip = useCallback(
    ({ item }: { item: ListEntry }) => (
      <View style={[styles.chip, { backgroundColor: semanticColors.skeleton[scheme] }]}>
        <Avatar imageUrl={item.image} name={item.name} size={22} />
        <Text style={[styles.chipText, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Pressable onPress={() => handleRemove(item.userId)} hitSlop={8}>
          <X size={14} color={semanticColors.labelSecondary[scheme]} />
        </Pressable>
      </View>
    ),
    [handleRemove, scheme],
  );

  const renderResultRow = useCallback(
    ({ item }: { item: ListEntry }) => (
      <Pressable
        onPress={() => handleAdd(item)}
        style={({ pressed }) => [
          styles.memberRow,
          { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
        ]}
      >
        <Avatar imageUrl={item.image} name={item.name} size={50} />
        <Text style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
          {item.name}
        </Text>
      </Pressable>
    ),
    [handleAdd, scheme],
  );

  const renderSeparator = useCallback(
    () => <View style={[styles.separator, { backgroundColor: semanticColors.divider[scheme] }]} />,
    [scheme],
  );

  const canCreate = !!groupName.trim() && selected.length > 0 && !isCreating;

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
          headerSearchBarOptions: {
            placeholder: "Rechercher un membre",
            onChangeText: (e) => setSearchText(e.nativeEvent.text),
            hideWhenScrolling: false,
          },
        }}
      />

      {isCreating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}

      {/* Selected members — pinned right below the search bar, not mixed into the scroll. */}
      {selected.length > 0 && (
        <FlatList
          horizontal
          data={selected}
          keyExtractor={(item) => item.id}
          renderItem={renderSelectedChip}
          contentContainerStyle={styles.chipRow}
          showsHorizontalScrollIndicator={false}
          style={[styles.chipList, { borderColor: semanticColors.divider[scheme] }]}
        />
      )}

      <FlatList
        style={[styles.list, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderResultRow}
        ItemSeparatorComponent={renderSeparator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          showSearchHint ? (
            selected.length === 0 ? (
              <EmptyState
                icon="Search"
                title="Rechercher un membre"
                description="Tapez au moins 2 caractères pour rechercher."
                containerStyle={styles.emptyState}
              />
            ) : null
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

      {/* Naming comes once at least one member is selected. */}
      {selected.length > 0 && (
        <View style={[styles.nameBar, { borderColor: semanticColors.divider[scheme] }]}>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Nom du groupe"
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            style={[styles.nameInput, { color: semanticColors.labelPrimary[scheme] }]}
          />
          <Pressable onPress={handleCreate} disabled={!canCreate} style={styles.createButton}>
            <Text
              style={[
                styles.createLabel,
                { color: canCreate ? semanticColors.accentGreen[scheme] : semanticColors.labelSecondary[scheme] },
              ]}
            >
              Créer
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  chipList: {
    maxHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chipRow: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    maxWidth: 160,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.horizontal,
    gap: 14,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 84,
  },
  emptyState: {
    flex: 1,
  },
  nameBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  createButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
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
