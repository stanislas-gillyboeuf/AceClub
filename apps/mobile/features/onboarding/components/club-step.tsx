import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, radii } from "@/constants/theme";
import { Building2, Search, Lock, Check, Plus } from "lucide-react-native";
import { useSearchOrganizations } from "@/hooks/use-organization";
import { StepHeader } from "./step-header";
import { PinModal } from "./pin-modal";
import { RequestClubModal } from "./request-club-modal";
import type { Organization } from "@/types/organization";
import * as Haptics from "expo-haptics";

interface ClubStepProps {
  selectedOrganization: Organization | null;
  isPinVerified: boolean;
  onSelect: (org: Organization) => void;
  onPinVerified: () => void;
  onPinError: (error: string) => void;
  pinError: string | null;
}

export function ClubStep({
  selectedOrganization,
  isPinVerified,
  onSelect,
  onPinVerified,
  onPinError,
  pinError,
}: ClubStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingOrg, setPendingOrg] = useState<Organization | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const { data, isLoading } = useSearchOrganizations(
    debouncedQuery || undefined
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectOrg = useCallback(
    (org: Organization) => {
      Haptics.selectionAsync();
      if (org.pinEnabled && !isPinVerified) {
        setPendingOrg(org);
        setShowPinModal(true);
      } else {
        onSelect(org);
      }
    },
    [isPinVerified, onSelect]
  );

  const handlePinVerify = useCallback(
    async (pin: string) => {
      if (!pendingOrg) return;
      setIsVerifyingPin(true);
      try {
        const { organizationService } = await import(
          "@/services/organization"
        );
        const result = await organizationService.verifyPin({
          organizationId: pendingOrg.id,
          pin,
        });
        if (result.valid) {
          onSelect(pendingOrg);
          onPinVerified();
          setShowPinModal(false);
          setPendingOrg(null);
        } else {
          onPinError("Code PIN incorrect");
        }
      } catch {
        onPinError("Erreur de verification");
      } finally {
        setIsVerifyingPin(false);
      }
    },
    [pendingOrg, onSelect, onPinVerified, onPinError]
  );

  const organizations = data?.organizations ?? [];

  const renderOrg = useCallback(
    ({ item }: { item: Organization }) => {
      const isSelected = selectedOrganization?.id === item.id;
      return (
        <Pressable
          onPress={() => handleSelectOrg(item)}
          style={[styles.orgRow, isSelected && styles.orgRowSelected]}
        >
          <View
            style={[
              styles.orgAvatar,
              isSelected && styles.orgAvatarSelected,
            ]}
          >
            <Text
              style={[
                styles.orgInitial,
                isSelected && styles.orgInitialSelected,
              ]}
            >
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.orgInfo}>
            <Text style={styles.orgName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.pinEnabled && (
              <View style={styles.pinBadge}>
                <Lock size={10} color={colors.accentOrange} />
                <Text style={styles.pinBadgeText}>PIN</Text>
              </View>
            )}
          </View>
          {isSelected && (
            <View style={styles.checkCircle}>
              <Check size={14} color={colors.white} />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedOrganization, handleSelectOrg]
  );

  return (
    <View style={styles.container}>
      <StepHeader
        icon={Building2}
        title="Dans quel club joues-tu ?"
        subtitle="Recherche ton club pour rejoindre la communaute"
      />

      <View style={styles.searchContainer}>
        <Search size={18} color={colors.gray400} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un club..."
          placeholderTextColor={colors.gray400}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.accentGreen} />
        </View>
      ) : organizations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {debouncedQuery
              ? "Aucun club trouve"
              : "Commence a taper pour chercher"}
          </Text>
          {debouncedQuery && (
            <Pressable
              onPress={() => setShowRequestModal(true)}
              style={styles.requestButton}
            >
              <Plus size={16} color={colors.accentGreen} />
              <Text style={styles.requestButtonText}>Proposer mon club</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={organizations}
          renderItem={renderOrg}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <PinModal
        visible={showPinModal}
        clubName={pendingOrg?.name ?? ""}
        isVerifying={isVerifyingPin}
        error={pinError}
        onVerify={handlePinVerify}
        onClose={() => {
          setShowPinModal(false);
          setPendingOrg(null);
        }}
      />

      <RequestClubModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray50,
    borderRadius: radii.md,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray400,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accentGreen,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.gray100,
  },
  orgRowSelected: {
    borderColor: colors.accentGreen,
    backgroundColor: `${colors.accentGreen}08`,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  orgAvatarSelected: {
    backgroundColor: `${colors.accentGreen}25`,
  },
  orgInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accentGreen,
  },
  orgInitialSelected: {
    color: colors.accentGreen,
  },
  orgInfo: {
    flex: 1,
    gap: 4,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  pinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: `${colors.accentOrange}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accentOrange,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
