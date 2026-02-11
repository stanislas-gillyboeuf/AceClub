import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
} from "@/tw";
import { Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Shield,
  Ban,
  CheckCircle,
  ChevronRight,
  Users,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import {
  useAdminUsers,
  useSetUserRole,
  useBanUser,
  useUnbanUser,
} from "@/hooks/useAdmin";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user";

export default function AdminScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const searchParams = useMemo(
    () =>
      searchQuery.length >= 2
        ? {
            searchValue: searchQuery,
            searchField: "name" as const,
            searchOperator: "contains" as const,
            limit: 50,
          }
        : { limit: 50 },
    [searchQuery]
  );

  const adminUsers = useAdminUsers(searchParams);
  const setRole = useSetUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    setRefreshing(false);
  }, [queryClient]);

  const handleSetRole = useCallback(
    (targetUser: User) => {
      const currentRole = targetUser.role ?? "user";
      const newRole = currentRole === "admin" ? "user" : "admin";
      const roleLabel = newRole === "admin" ? "administrateur" : "utilisateur";

      Alert.alert(
        "Changer le rôle",
        `Définir ${targetUser.name} comme ${roleLabel} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Confirmer",
            onPress: () =>
              setRole.mutate({ userId: targetUser.id, role: newRole }),
          },
        ]
      );
    },
    [setRole]
  );

  const handleBan = useCallback(
    (targetUser: User) => {
      if (targetUser.banned) {
        Alert.alert(
          "Débannir",
          `Débannir ${targetUser.name} ?`,
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Débannir",
              onPress: () => unbanUser.mutate(targetUser.id),
            },
          ]
        );
      } else {
        Alert.alert(
          "Bannir",
          `Bannir ${targetUser.name} ?`,
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Bannir",
              style: "destructive",
              onPress: () =>
                banUser.mutate({ userId: targetUser.id }),
            },
          ]
        );
      }
    },
    [banUser, unbanUser]
  );

  const users = adminUsers.data?.users ?? [];

  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      const isExpanded = selectedUserId === item.id;
      const isCurrentUser = item.id === user?.id;

      return (
        <Card className="mb-2">
          <Pressable
            onPress={() =>
              setSelectedUserId(isExpanded ? null : item.id)
            }
            className="flex-row items-center gap-3 p-card"
          >
            <Avatar
              imageUrl={item.image}
              name={item.name}
              size={40}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                  {item.name}
                </Text>
                {item.role === "admin" && (
                  <Badge variant="primary">Admin</Badge>
                )}
                {item.banned && (
                  <Badge variant="destructive">Banni</Badge>
                )}
                {item.isGhost && (
                  <Badge>Fantôme</Badge>
                )}
              </View>
              <Text
                className="text-sm font-sans text-label-secondary"
                numberOfLines={1}
              >
                {item.email}
              </Text>
            </View>
            <ChevronRight
              size={16}
              color="#C7C7CC"
              style={{
                transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
              }}
            />
          </Pressable>

          {isExpanded && (
            <View className="px-card pb-card gap-2">
              <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50" />

              {/* User info */}
              <View className="gap-1 mt-2">
                <Text className="text-xs font-sans text-label-secondary">
                  ID: {item.id}
                </Text>
                {item.createdAt && (
                  <Text className="text-xs font-sans text-label-secondary">
                    Inscrit le{" "}
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </Text>
                )}
                {item.phoneNumber && (
                  <Text className="text-xs font-sans text-label-secondary">
                    Tél: {item.phoneNumber}
                  </Text>
                )}
                {item.onboardingCompleted === false && (
                  <Text className="text-xs font-sans text-accent-orange">
                    Onboarding non complété
                  </Text>
                )}
              </View>

              {/* Actions */}
              {!isCurrentUser && (
                <View className="flex-row gap-2 mt-2">
                  <Pressable
                    onPress={() => handleSetRole(item)}
                    disabled={setRole.isPending}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-md bg-primary/10 dark:bg-primary-dark/10"
                  >
                    <Shield size={14} color="#34C759" />
                    <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                      {item.role === "admin" ? "Retirer admin" : "Rendre admin"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleBan(item)}
                    disabled={banUser.isPending || unbanUser.isPending}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-md ${
                      item.banned
                        ? "bg-primary/10 dark:bg-primary-dark/10"
                        : "bg-destructive/10 dark:bg-destructive-dark/10"
                    }`}
                  >
                    {item.banned ? (
                      <>
                        <CheckCircle size={14} color="#34C759" />
                        <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                          Débannir
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ban size={14} color="#FF3B30" />
                        <Text className="text-sm font-sans-medium text-destructive dark:text-destructive-dark">
                          Bannir
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </Card>
      );
    },
    [selectedUserId, user?.id, handleSetRole, handleBan, setRole.isPending, banUser.isPending, unbanUser.isPending]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Administration
        </Text>
        {adminUsers.data && (
          <Text className="text-sm font-sans text-label-secondary">
            {adminUsers.data.total} utilisateurs
          </Text>
        )}
      </View>

      {/* Search */}
      <View className="px-horizontal pb-3">
        <View className="flex-row items-center gap-2 bg-bg-input dark:bg-bg-input-dark rounded-[10px] px-3.5">
          <Search size={18} color="#8E8E93" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor="#8E8E93"
            className="flex-1 text-label-primary dark:text-label-primary-dark font-sans text-base py-3.5"
            autoCorrect={false}
          />
          {adminUsers.isLoading && (
            <ActivityIndicator size="small" color="#34C759" />
          )}
        </View>
      </View>

      {/* User list */}
      {users.length === 0 && !adminUsers.isLoading ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur"
          description="Aucun utilisateur trouvé avec ces critères."
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#34C759"
            />
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
