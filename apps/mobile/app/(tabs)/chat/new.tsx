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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { authClient } from "@/lib/auth-client";
import { ChevronRight, X } from "lucide-react-native";
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
  const { data: orgs } = useMyOrganizations();
  const orgId = orgs?.[0]?.id ?? "";
  const { data: membersData, isLoading } = useMembers(orgId);
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const members = useMemo(() => {
    if (!membersData?.members) return [];
    return membersData.members.filter(
      (m) => m.userId !== currentUserId && m.user != null && m.role !== "owner",
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
        router.replace(`/conversation/${result.conversationId}`);
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
          <Avatar imageUrl={item.user.image} name={item.user.name} size={50} />
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
    <>
      <Stack.Screen
        options={{
          title: "Nouveau message",
          headerSearchBarOptions: {
            placeholder: "Rechercher un membre",
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
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
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
              title="Aucun membre"
              description={
                searchText
                  ? "Aucun membre ne correspond à votre recherche."
                  : "Aucun membre disponible pour démarrer une conversation."
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
