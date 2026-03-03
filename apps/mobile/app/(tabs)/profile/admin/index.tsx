import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react-native";

import { useMyOrganizations, useActiveMemberRole, useMembers, useOrganizationPin, useToggleOrganizationPin, useRegenerateOrganizationPin } from "@/hooks/use-organization";
import { useAdminEvents } from "@/hooks/use-event";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { OrgHubSettingsCard } from "@/features/profile/components/OrgHubSettingsCard";
import { OrgHubMembersCard } from "@/features/profile/components/OrgHubMembersCard";
import { OrgHubEventsSection } from "@/features/profile/components/OrgHubEventsSection";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MemberRole } from "@/types/common";

export default function AdminHub() {
  const scheme = useColorScheme();
  const { data: orgs, isLoading: orgsLoading, refetch: refetchOrgs } = useMyOrganizations();
  const { data: memberRole, refetch: refetchRole } = useActiveMemberRole();
  const primaryOrg = orgs?.[0] ?? null;
  const orgId = primaryOrg?.id ?? "";
  const role = (memberRole?.role ?? "member") as MemberRole;

  const { data: membersData, refetch: refetchMembers } = useMembers(orgId);
  const members = membersData?.members ?? [];
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useAdminEvents({ limit: 10 });

  const isOwner = role === "owner";

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchOrgs(), refetchRole(), refetchMembers(), refetchEvents()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchOrgs, refetchRole, refetchMembers, refetchEvents]);

  if (orgsLoading && !primaryOrg) {
    return (
      <>
        <Stack.Screen options={{ title: "Mon Club" }} />
        <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </View>
      </>
    );
  }

  if (!primaryOrg) {
    return (
      <>
        <Stack.Screen options={{ title: "Mon Club" }} />
        <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <Text style={[styles.emptyText, { color: semanticColors.labelSecondary[scheme] }]}>
            Aucun club
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Mon Club", headerLargeTitle: true }} />

      <ScrollView
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Settings Card */}
        <OrgHubSettingsCard organization={primaryOrg} />

        {/* Members Card */}
        <OrgHubMembersCard members={members} />

        {/* Events Section */}
        <OrgHubEventsSection events={events ?? []} isLoading={eventsLoading} />

        {/* PIN Section — owner only */}
        {isOwner && <PinSection organizationId={orgId} />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

function PinSection({ organizationId }: { organizationId: string }) {
  const scheme = useColorScheme();
  const { data: pinData } = useOrganizationPin(organizationId);
  const togglePin = useToggleOrganizationPin();
  const regeneratePin = useRegenerateOrganizationPin();
  const [showPin, setShowPin] = useState(false);

  const pinEnabled = pinData?.enabled ?? false;
  const pinCode = pinData?.pin ?? "----";

  const handleToggle = (value: boolean) => {
    togglePin.mutate({ organizationId, enabled: value });
  };

  const handleCopy = () => {
    if (pinData?.pin) {
      Alert.alert("Code PIN", pinData.pin);
    }
  };

  const handleRegenerate = () => {
    regeneratePin.mutate(organizationId);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
        Code PIN
      </Text>
      <GlassView style={styles.pinCard}>
        <View style={styles.pinToggleRow}>
          <Text style={[styles.pinLabel, { color: semanticColors.labelPrimary[scheme] }]}>
            Activer le code PIN
          </Text>
          <Switch
            value={pinEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: semanticColors.labelTertiary[scheme], true: colors.accentGreen }}
          />
        </View>

        {pinEnabled && (
          <>
            <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

            <View style={styles.pinDisplayRow}>
              <Text style={[styles.pinCode, { color: semanticColors.labelPrimary[scheme] }]}>
                {showPin ? pinCode : "••••"}
              </Text>
              <View style={styles.pinActions}>
                <Pressable onPress={() => setShowPin(!showPin)} hitSlop={8}>
                  {showPin ? (
                    <EyeOff size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                  ) : (
                    <Eye size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                  )}
                </Pressable>
                <Pressable onPress={handleCopy} hitSlop={8}>
                  <Copy size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                </Pressable>
                <Pressable onPress={handleRegenerate} hitSlop={8}>
                  <RefreshCw size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </GlassView>
    </View>
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
  emptyText: {
    fontSize: 15,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  pinCard: {
    borderRadius: radii.md,
    padding: 14,
    gap: 12,
  },
  pinToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  pinDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pinCode: {
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 4,
  },
  pinActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
