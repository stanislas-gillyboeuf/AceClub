import { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useMe, usePreferences } from "@/hooks/use-user";
import { useMyLevel } from "@/hooks/use-level";
import { useMyBadges, useAllBadges } from "@/hooks/use-reward";
import { useMatchIntents, useDeleteMatchIntent } from "@/hooks/use-match-intent";
import { useMyOrganizations, useActiveMemberRole } from "@/hooks/use-organization";
import { useUserInvitations, useAcceptInvitation, useRejectInvitation } from "@/hooks/use-invitation";
import { useMatches } from "@/hooks/use-match";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";
import { clearAuthData } from "@/lib/auth-api";
import { queryClient } from "@/lib/query-client";

import { ProfileHeaderCard } from "@/features/profile/components/profile-header-card";
import { ProfileBadgeSection } from "@/features/profile/components/profile-badge-section";
import { MatchIntentList } from "@/features/profile/components/match-intent-list";
import { CourtBookingCard } from "@/features/profile/components/court-booking-card";
import { OrganizationCard } from "@/features/profile/components/organization-card";
import { InvitationList } from "@/features/profile/components/invitation-list";
import { canAccessHub } from "@/features/profile/lib/role-permissions";
import Button from "@/components/ui/button";
import { semanticColors, spacing, colors } from "@/constants/theme";
import type { MemberRole } from "@/types/common";
import type { MatchWithParticipants } from "@/types/match";

function calculateMatchStats(matches: MatchWithParticipants[], userId: string) {
  let totalMatches = 0;
  let wins = 0;
  let totalPlaytimeMinutes = 0;

  for (const match of matches) {
    if (match.status !== "finished") continue;
    totalMatches++;

    // Calculate playtime
    if (match.startedAt && match.finishedAt) {
      const start = new Date(match.startedAt).getTime();
      const end = new Date(match.finishedAt).getTime();
      const diffMinutes = Math.floor((end - start) / 60000);
      if (diffMinutes > 0) totalPlaytimeMinutes += diffMinutes;
    }

    // Determine winner by set wins
    if (match.sets && match.sets.length > 0) {
      const myParticipant = match.participants.find((p) => p.userId === userId);
      if (!myParticipant) continue;

      let mySetsWon = 0;
      let theirSetsWon = 0;

      for (const set of match.sets) {
        const myScore = set.scores?.find((s) => s.userId === userId)?.games ?? 0;
        const otherScores = set.scores?.filter((s) => s.userId !== userId) ?? [];
        const theirMaxScore = Math.max(...otherScores.map((s) => s.games ?? 0), 0);

        if (myScore > theirMaxScore) mySetsWon++;
        else if (theirMaxScore > myScore) theirSetsWon++;
      }

      if (mySetsWon > theirSetsWon) wins++;
    }
  }

  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return { totalMatches, winRate, totalPlaytimeMinutes };
}

export default function Profile() {
  const scheme = useColorScheme();
  const router = useRouter();

  // Data queries
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useMe();
  const { data: preferences, refetch: refetchPrefs } = usePreferences();
  const { data: level, refetch: refetchLevel } = useMyLevel();
  const { data: badgesData, refetch: refetchBadges } = useMyBadges();
  const { data: allBadgesData } = useAllBadges();
  const {
    data: intentsData,
    isLoading: intentsLoading,
    error: intentsError,
    refetch: refetchIntents,
  } = useMatchIntents();
  const { data: orgs, refetch: refetchOrgs } = useMyOrganizations();
  const { data: memberRole } = useActiveMemberRole();
  const {
    data: invitations,
    refetch: refetchInvitations,
  } = useUserInvitations();
  const { data: matchesData } = useMatches({ status: "finished", limit: 100 });

  // Mutations
  const deleteIntent = useDeleteMatchIntent();
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingIntentId, setDeletingIntentId] = useState<string | null>(null);
  const [loadingInvitationId, setLoadingInvitationId] = useState<string | null>(null);

  // Derived data
  const currentUserId = user?.id ?? "";
  const matchIntents = intentsData?.data ?? [];
  const primaryOrg = orgs?.[0] ?? null;
  const pendingInvitations = (invitations ?? []).filter((i) => i.status === "pending");
  const badges = (badgesData?.badges ?? []).map((b) => ({ ...b, isUnlocked: true }));
  const totalBadges = allBadgesData?.badges?.length ?? 0;

  const matchStats = useMemo(() => {
    const allMatches = matchesData?.matches ?? [];
    return calculateMatchStats(allMatches, currentUserId);
  }, [matchesData, currentUserId]);

  // Refresh all
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        refetchPrefs(),
        refetchLevel(),
        refetchBadges(),
        refetchIntents(),
        refetchOrgs(),
        refetchInvitations(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchUser, refetchPrefs, refetchLevel, refetchBadges, refetchIntents, refetchOrgs, refetchInvitations]);

  // Delete match intent
  const handleDeleteIntent = useCallback(
    (id: string) => {
      setDeletingIntentId(id);
      deleteIntent.mutate(id, {
        onSettled: () => setDeletingIntentId(null),
      });
    },
    [deleteIntent]
  );

  // Accept/reject invitation
  const handleAcceptInvitation = useCallback(
    (id: string) => {
      setLoadingInvitationId(id);
      acceptInvitation.mutate(id, {
        onSettled: () => {
          setLoadingInvitationId(null);
          refetchOrgs();
        },
      });
    },
    [acceptInvitation, refetchOrgs]
  );

  const handleRejectInvitation = useCallback(
    (id: string) => {
      setLoadingInvitationId(id);
      rejectInvitation.mutate(id, {
        onSettled: () => setLoadingInvitationId(null),
      });
    },
    [rejectInvitation]
  );

  const handleSignOut = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await authClient.signOut();
            } catch {
              // Ignore sign-out errors — we clear local data anyway
            }
            await clearAuthData();
            queryClient.clear();
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  };

  // Navigation
  const openSettings = () => router.push("/(tabs)/profile/settings");
  const openCreateIntent = () => router.push("/(tabs)/profile/create-intent");
  const openCourtBooking = () => router.push("/(tabs)/profile/court-booking");
  const openMyBookings = () => router.push("/(tabs)/profile/court-booking/my-bookings");

  const isLoading = userLoading && !user;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Profil", headerLargeTitle: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profil",
          headerLargeTitle: true,
          headerStyle: { padding: Platform.OS === "android" ? 8 : undefined },
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={openSettings} hitSlop={8}>
                    <MaterialIcons name="settings" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="gearshape" onPress={openSettings} tintColor={colors.accentGreen} />
        </Stack.Toolbar>
      )}

      <ScrollView
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        {user && (
          <ProfileHeaderCard
            user={user}
            preferences={preferences ?? null}
            level={level ?? null}
            matchStats={matchStats}
          />
        )}

        {/* Badges */}
        <ProfileBadgeSection badges={badges} totalBadges={totalBadges} />

        {/* Match Intents */}
        <MatchIntentList
          intents={matchIntents}
          isLoading={intentsLoading}
          error={intentsError?.message}
          onDelete={handleDeleteIntent}
          onCreateNew={openCreateIntent}
          deletingId={deletingIntentId}
        />

        {/* Court booking */}
        <CourtBookingCard onPressBook={openCourtBooking} onPressMyBookings={openMyBookings} />

        {/* Invitations */}
        <InvitationList
          invitations={pendingInvitations}
          onAccept={handleAcceptInvitation}
          onReject={handleRejectInvitation}
          loadingId={loadingInvitationId}
        />

        {/* Organization */}
        <OrganizationCard
          organization={primaryOrg}
          memberRole={memberRole?.role}
        />

        {/* Manage Club — owners and admins only */}
        {canAccessHub(memberRole?.role as MemberRole) && (
          <Button
            label="Gérer le club"
            onPress={() => router.push("/(tabs)/profile/admin")}
            variant="secondary"
          />
        )}

        <View style={{ width: '100%' }}>
        <Button
          label="Déconnexion"
          onPress={handleSignOut}
          variant="destructive"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.horizontal,
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
