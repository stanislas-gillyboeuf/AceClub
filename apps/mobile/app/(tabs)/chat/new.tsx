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
import { useMembers } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, Search } from "lucide-react-native";
import { conversationService } from "@/services/conversation";
import type { Member } from "@/types/organization";

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
  const { data: membersData, isLoading } = useMembers();
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const members = useMemo(() => {
    if (!membersData?.members) return [];
    return membersData.members.filter(
      (m) => m.userId !== currentUserId && m.user != null,
    );
  }, [membersData, currentUserId]);

  const filteredMembers = useMemo(() => {
    if (!searchText.trim()) return members;
    const query = searchText.toLowerCase();
    return members.filter((m) =>
      m.user?.name?.toLowerCase().includes(query),
    );
  }, [members, searchText]);

  const handleSelectMember = useCallback(
    async (member: Member) => {
      setIsCreating(true);
      try {
        const result = await conversationService.findOrCreateConversation(member.userId);
        router.replace(`/(tabs)/chat/${result.conversationId}`);
      } catch {
        Alert.alert("Erreur", "Impossible de créer la conversation");
      } finally {
        setIsCreating(false);
      }
    },
    [router],
  );

  const renderMember = useCallback(
    ({ item }: { item: Member }) => {
      if (!item.user) return null;
      return (
        <Pressable
          onPress={() => handleSelectMember(item)}
          style={({ pressed }) => [
            styles.memberRow,
            { backgroundColor: pressed ? semanticColors.skeleton[scheme] : "transparent" },
          ]}
          disabled={isCreating}
        >
          <Avatar
            imageUrl={item.user.image}
            name={item.user.name}
            size={50}
          />
          <View style={styles.memberInfo}>
            <Text
              style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]}
              numberOfLines={1}
            >
              {item.user.name}
            </Text>
            <Text
              style={[styles.memberRole, { color: semanticColors.labelSecondary[scheme] }]}
              numberOfLines={1}
            >
              {getRoleDisplayName(item.role)}
            </Text>
          </View>
          <ChevronRight size={16} color={semanticColors.labelSecondary[scheme]} />
        </Pressable>
      );
    },
    [handleSelectMember, scheme, isCreating],
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
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen
        options={{
          title: "Nouveau message",
          presentation: "modal",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: "#007AFF", fontSize: 17 }}>Annuler</Text>
            </Pressable>
          ),
        }}
      />

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: scheme === "dark" ? "#1C1C1E" : "#E5E5EA",
          },
        ]}
      >
        <Search size={18} color={semanticColors.labelSecondary[scheme]} />
        <TextInput
          style={[styles.searchInput, { color: semanticColors.labelPrimary[scheme] }]}
          placeholder="Rechercher un membre"
          placeholderTextColor={semanticColors.labelSecondary[scheme]}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isCreating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentGreen} />
        </View>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon="Users"
          title="Aucun membre"
          description={
            searchText
              ? "Aucun membre ne correspond à votre recherche."
              : "Aucun membre disponible pour démarrer une conversation."
          }
          containerStyle={styles.emptyState}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={filteredMembers}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 20,
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
