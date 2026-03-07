import { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack } from "expo-router";

import {
  useMyOrganizations,
  useActiveMember,
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MemberRow } from "@/features/profile/components/MemberRow";
import { ROLE_LABELS } from "@/features/profile/lib/role-permissions";
import { colors, semanticColors, spacing } from "@/constants/theme";
import type { MemberRole } from "@/types/common";
import type { Member } from "@/types/organization";

const ROLE_ORDER: Record<MemberRole, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};

export default function MembersScreen() {
  const scheme = useColorScheme();
  const { data: orgs } = useMyOrganizations();
  const { data: activeMember } = useActiveMember();
  const orgId = orgs?.[0]?.id ?? "";
  const { data: membersData, isLoading, refetch, isRefetching } = useMembers(orgId);
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();

  const actorRole = (activeMember?.role ?? "member") as MemberRole;
  const actorId = activeMember?.userId ?? "";

  const sortedMembers = useMemo(() => {
    const list = membersData?.members ?? [];
    return [...list].sort(
      (a, b) =>
        ROLE_ORDER[a.role as MemberRole] - ROLE_ORDER[b.role as MemberRole],
    );
  }, [membersData]);

  const handleChangeRole = useCallback(
    (memberId: string, newRole: MemberRole, memberName: string) => {
      Alert.alert(
        "Changer le rôle",
        `Passer ${memberName} en ${ROLE_LABELS[newRole]} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Confirmer",
            onPress: () => updateRole.mutate({ memberId, role: newRole }),
          },
        ],
      );
    },
    [updateRole],
  );

  const handleRemove = useCallback(
    (memberId: string, memberName: string) => {
      Alert.alert(
        "Retirer du club",
        `Retirer ${memberName} du club ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Retirer",
            style: "destructive",
            onPress: () => removeMember.mutate({ memberIdOrEmail: memberId }),
          },
        ],
      );
    },
    [removeMember],
  );

  const renderItem = useCallback(
    ({ item }: { item: Member }) => (
      <MemberRow
        member={item}
        actorRole={actorRole}
        actorId={actorId}
        onChangeRole={handleChangeRole}
        onRemove={handleRemove}
      />
    ),
    [actorRole, actorId, handleChangeRole, handleRemove],
  );

  return (
    <>
      <Stack.Screen options={{ title: "Membres" }} />

      <FlatList
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        data={sortedMembers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accentGreen} />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: semanticColors.labelSecondary[scheme] }]}>
                Aucun membre
              </Text>
            </View>
          )
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.horizontal,
    gap: 10,
    paddingBottom: 40,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
});
