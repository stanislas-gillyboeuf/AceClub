import { useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { courtColors } from "@/features/court-booking/theme";
import { useMyOrganizations, useActiveMemberRole } from "@/hooks/use-organization";
import { useAllCourtsForOrg, useUpdateCourt } from "@/hooks/use-court";
import { CourtRow } from "@/features/court-booking/components/admin/court-row";
import type { Court } from "@/types/court";
import type { MemberRole } from "@/types/common";

export default function ManageCourtsScreen() {
  const { data: orgs, isLoading: orgsLoading } = useMyOrganizations();
  const { data: memberRole, isLoading: roleLoading } = useActiveMemberRole();
  const organizationId = orgs?.[0]?.id;
  const isAdmin = ["owner", "admin"].includes((memberRole?.role ?? "") as MemberRole);

  const { data: courts, isLoading: courtsLoading, refetch, isRefetching } =
    useAllCourtsForOrg(organizationId);
  const updateCourt = useUpdateCourt();

  const handleEdit = useCallback((courtId: string) => {
    router.push(`/court-booking/court-form?courtId=${courtId}`);
  }, []);

  const handleToggleActive = useCallback(
    (court: Court) => {
      updateCourt.mutate({ courtId: court.id, isActive: !court.isActive });
    },
    [updateCourt],
  );

  const isLoading = orgsLoading || roleLoading || courtsLoading;

  if (!isLoading && !isAdmin) {
    return (
      <>
        <Stack.Screen options={{ title: "Gérer mes terrains" }} />
        <View style={styles.screen}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Accès réservé</Text>
            <Text style={styles.emptyDescription}>
              Seuls les admins du club peuvent gérer les terrains.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Gérer mes terrains" }} />
      <FlatList
        data={courts ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <CourtRow
              court={item}
              onEdit={() => handleEdit(item.id)}
              onToggleActive={() => handleToggleActive(item)}
              isToggling={updateCourt.isPending}
            />
          </View>
        )}
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <Pressable
            onPress={() => router.push("/court-booking/court-form")}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Ajouter un court</Text>
          </Pressable>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} color={courtColors.chartreuse} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucun terrain</Text>
              <Text style={styles.emptyDescription}>
                Ajoute ton premier terrain pour activer les réservations.
              </Text>
            </View>
          )
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink900,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  addButton: {
    backgroundColor: courtColors.chartreuse,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    fontWeight: "700",
    fontSize: 15,
    color: courtColors.ink900,
  },
  row: {
    marginBottom: 10,
  },
  loader: {
    paddingVertical: 24,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: courtColors.chalk,
  },
  emptyDescription: {
    fontSize: 13.5,
    color: courtColors.chalkDim,
    textAlign: "center",
  },
});
