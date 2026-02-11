import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "@/tw";
import { Alert, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Users,
  Swords,
  Activity,
  Crown,
  Shield,
  Mail,
  Lock,
  LogOut,
  Plus,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import {
  useOrganization,
  useOrganizationStats,
  useLeaveOrganization,
  useRemoveMember,
} from "@/hooks/useOrganizations";
import {
  useOrgInvitations,
  useCreateInvitation,
  useCancelInvitation,
} from "@/hooks/useInvitations";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQueryClient } from "@tanstack/react-query";
import type { Member, MemberRole } from "@/types/organization";

function getRoleLabel(role: MemberRole): string {
  switch (role) {
    case "owner":
      return "Propriétaire";
    case "admin":
      return "Admin";
    case "member":
      return "Membre";
  }
}

function getRoleIcon(role: MemberRole) {
  switch (role) {
    case "owner":
      return Crown;
    case "admin":
      return Shield;
    default:
      return null;
  }
}

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const org = useOrganization(id ?? "");
  const stats = useOrganizationStats(org.data?.id ?? "");
  const invitations = useOrgInvitations(org.data?.id ?? "");
  const leaveOrg = useLeaveOrganization();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();
  const createInvitation = useCreateInvitation();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["organization"] });
    await queryClient.invalidateQueries({ queryKey: ["invitations"] });
    setRefreshing(false);
  }, [queryClient]);

  const currentMember = useMemo(() => {
    if (!org.data?.members || !user?.id) return null;
    return org.data.members.find((m) => m.userId === user.id) ?? null;
  }, [org.data?.members, user?.id]);

  const isAdminOrOwner =
    currentMember?.role === "admin" || currentMember?.role === "owner";

  const handleLeave = useCallback(() => {
    if (!org.data?.id) return;
    Alert.alert(
      "Quitter le club",
      `Voulez-vous vraiment quitter ${org.data.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Quitter",
          style: "destructive",
          onPress: () => {
            leaveOrg.mutate(org.data!.id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ]
    );
  }, [org.data, leaveOrg, router]);

  const handleRemoveMember = useCallback(
    (member: Member) => {
      Alert.alert(
        "Retirer le membre",
        `Voulez-vous retirer ${member.user.name} du club ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Retirer",
            style: "destructive",
            onPress: () => {
              removeMember.mutate({
                memberIdOrEmail: member.userId,
                organizationId: org.data?.id,
              });
            },
          },
        ]
      );
    },
    [removeMember, org.data?.id]
  );

  const handleCancelInvitation = useCallback(
    (invitationId: string) => {
      Alert.alert("Annuler l'invitation", "Confirmer l'annulation ?", [
        { text: "Non", style: "cancel" },
        {
          text: "Annuler l'invitation",
          style: "destructive",
          onPress: () => cancelInvitation.mutate(invitationId),
        },
      ]);
    },
    [cancelInvitation]
  );

  const handleInvite = useCallback(
    (email: string) => {
      if (!email.trim() || !org.data?.id) return;
      createInvitation.mutate(
        { email: email.trim(), organizationId: org.data.id },
        {
          onSuccess: () => {
            Alert.alert(
              "Invitation envoyée",
              `Une invitation a été envoyée à ${email}.`
            );
          },
          onError: () => {
            Alert.alert("Erreur", "Impossible d'envoyer l'invitation.");
          },
        }
      );
    },
    [createInvitation, org.data?.id]
  );

  const pendingInvitations = useMemo(
    () => (invitations.data ?? []).filter((inv) => inv.status === "pending"),
    [invitations.data]
  );

  if (org.isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
        edges={["top"]}
      >
        <View className="flex-row items-center px-horizontal py-2">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color="#34C759" />
          </Pressable>
        </View>
        <View className="px-horizontal pt-4 gap-4">
          <Skeleton height={80} width="100%" />
          <Skeleton height={60} width="100%" />
          <Skeleton height={200} width="100%" />
        </View>
      </SafeAreaView>
    );
  }

  if (!org.data) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
        edges={["top"]}
      >
        <View className="flex-row items-center px-horizontal py-2">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color="#34C759" />
          </Pressable>
        </View>
        <EmptyState
          icon={Users}
          title="Club introuvable"
          description="Ce club n'existe pas ou vous n'y avez pas accès."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
        <Text
          className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark flex-1 text-center"
          numberOfLines={1}
        >
          {org.data.name}
        </Text>
        <View className="w-16" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#34C759"
          />
        }
      >
        {/* Org Header Card */}
        <View className="px-horizontal mt-2">
          <Card className="p-card">
            <View className="flex-row items-center gap-4">
              <Avatar
                imageUrl={org.data.logo}
                name={org.data.name}
                size={56}
              />
              <View className="flex-1">
                <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark">
                  {org.data.name}
                </Text>
                {org.data.address && (
                  <Text
                    className="text-sm font-sans text-label-secondary mt-0.5"
                    numberOfLines={1}
                  >
                    {org.data.address}
                  </Text>
                )}
                {currentMember && (
                  <Badge
                    variant={
                      currentMember.role === "owner"
                        ? "orange"
                        : currentMember.role === "admin"
                        ? "primary"
                        : "default"
                    }
                    className="mt-1 self-start"
                  >
                    {getRoleLabel(currentMember.role)}
                  </Badge>
                )}
              </View>
            </View>
          </Card>
        </View>

        {/* Stats */}
        {stats.data && (
          <View className="px-horizontal mt-4">
            <Card className="p-card">
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <View className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary-dark/10 items-center justify-center mb-1">
                    <Users size={18} color="#34C759" />
                  </View>
                  <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
                    {stats.data.totalMembers}
                  </Text>
                  <Text className="text-xs font-sans text-label-secondary">
                    Membres
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <View className="w-9 h-9 rounded-full bg-accent-orange/10 items-center justify-center mb-1">
                    <Swords size={18} color="#FF9500" />
                  </View>
                  <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
                    {stats.data.matchesThisMonth}
                  </Text>
                  <Text className="text-xs font-sans text-label-secondary">
                    Matchs/mois
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <View className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary-dark/10 items-center justify-center mb-1">
                    <Activity size={18} color="#34C759" />
                  </View>
                  <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
                    {Math.round(stats.data.activityRate * 100)}%
                  </Text>
                  <Text className="text-xs font-sans text-label-secondary">
                    Activité
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Members */}
        <View className="px-horizontal mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
              Membres ({org.data.members?.length ?? 0})
            </Text>
            {isAdminOrOwner && (
              <Pressable
                onPress={() => {
                  Alert.prompt(
                    "Inviter un membre",
                    "Entrez l'adresse email du joueur",
                    [
                      { text: "Annuler", style: "cancel" },
                      {
                        text: "Inviter",
                        onPress: (email?: string) => email && handleInvite(email),
                      },
                    ],
                    "plain-text",
                    "",
                    "email-address"
                  );
                }}
                hitSlop={8}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color="#34C759" />
                <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
                  Inviter
                </Text>
              </Pressable>
            )}
          </View>

          <Card>
            {(org.data.members ?? []).map((member, index) => {
              const RoleIcon = getRoleIcon(member.role);
              const isCurrentUser = member.userId === user?.id;

              return (
                <Pressable
                  key={member.id}
                  className={`flex-row items-center gap-3 p-card ${
                    index < (org.data!.members?.length ?? 0) - 1
                      ? "border-b-[0.5px] border-border/50 dark:border-border-dark/50"
                      : ""
                  }`}
                  onLongPress={
                    isAdminOrOwner && !isCurrentUser && member.role !== "owner"
                      ? () => handleRemoveMember(member)
                      : undefined
                  }
                >
                  <Avatar
                    imageUrl={member.user.image}
                    name={member.user.name}
                    size={40}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                        {member.user.name}
                      </Text>
                      {isCurrentUser && (
                        <Text className="text-xs font-sans text-label-secondary">
                          (vous)
                        </Text>
                      )}
                    </View>
                    <Text className="text-sm font-sans text-label-secondary">
                      {member.user.email}
                    </Text>
                  </View>
                  {RoleIcon && (
                    <RoleIcon
                      size={16}
                      color={member.role === "owner" ? "#FF9500" : "#34C759"}
                    />
                  )}
                </Pressable>
              );
            })}
          </Card>
        </View>

        {/* Pending Invitations */}
        {isAdminOrOwner && pendingInvitations.length > 0 && (
          <View className="px-horizontal mt-6">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark mb-3">
              Invitations en attente ({pendingInvitations.length})
            </Text>
            <Card>
              {pendingInvitations.map((inv, index) => (
                <View
                  key={inv.id}
                  className={`flex-row items-center gap-3 p-card ${
                    index < pendingInvitations.length - 1
                      ? "border-b-[0.5px] border-border/50 dark:border-border-dark/50"
                      : ""
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-bg-secondary dark:bg-bg-secondary-dark items-center justify-center">
                    <Mail size={18} color="#8E8E93" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                      {inv.email}
                    </Text>
                    <Text className="text-sm font-sans text-label-secondary">
                      {getRoleLabel(inv.role as MemberRole)} - En attente
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleCancelInvitation(inv.id)}
                    hitSlop={8}
                    disabled={cancelInvitation.isPending}
                  >
                    <Text className="text-sm font-sans-medium text-destructive dark:text-destructive-dark">
                      Annuler
                    </Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* PIN Section */}
        {isAdminOrOwner && org.data.pinEnabled && (
          <View className="px-horizontal mt-6">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark mb-3">
              Code PIN
            </Text>
            <Card className="p-card flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-md bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
                <Lock size={18} color="#34C759" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans text-label-secondary">
                  Le code PIN permet aux joueurs de rejoindre le club
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Leave organization */}
        {currentMember && currentMember.role !== "owner" && (
          <View className="px-horizontal mt-6">
            <Pressable onPress={handleLeave} disabled={leaveOrg.isPending}>
              <Card className="p-card flex-row items-center gap-3">
                <LogOut size={18} color="#FF3B30" />
                <Text className="text-base font-sans-medium text-destructive dark:text-destructive-dark">
                  Quitter le club
                </Text>
                {leaveOrg.isPending && (
                  <ActivityIndicator size="small" color="#FF3B30" />
                )}
              </Card>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
