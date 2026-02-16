import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Search, X, Building2, Lock, ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchOrganizations, useVerifyPin, useRequestClub } from "@/hooks/use-organization";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { FormField } from "@/components/ui/form-field";
import type { Organization } from "@/types/organization";

interface ClubSelectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (organization: Organization, pin?: string) => void;
  selectedId?: string | null;
}

export function ClubSelectionModal({
  visible,
  onDismiss,
  onSelect,
  selectedId,
}: ClubSelectionModalProps) {
  const scheme = useColorScheme();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [pinOrg, setPinOrg] = useState<Organization | null>(null);
  const [pin, setPin] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestCity, setRequestCity] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: searchData, isLoading } = useSearchOrganizations(
    debouncedQuery || undefined,
    20,
    offset
  );
  const verifyPin = useVerifyPin();
  const requestClub = useRequestClub();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setOffset(0);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const organizations = searchData?.organizations ?? [];

  const handleOrgPress = (org: Organization) => {
    if (org.pinEnabled) {
      setPinOrg(org);
      setPin("");
    } else {
      onSelect(org);
    }
  };

  const handlePinSubmit = () => {
    if (!pinOrg) return;
    verifyPin.mutate(
      { organizationId: pinOrg.id, pin },
      {
        onSuccess: (result) => {
          if (result.valid) {
            onSelect(pinOrg!, pin);
            setPinOrg(null);
          } else {
            Alert.alert("PIN incorrect", "Le code PIN est invalide.");
          }
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible de vérifier le PIN.");
        },
      }
    );
  };

  const handleRequestSubmit = () => {
    if (!requestName.trim() || !requestCity.trim()) return;
    requestClub.mutate(
      { name: requestName.trim(), city: requestCity.trim() },
      {
        onSuccess: () => {
          Alert.alert("Demande envoyée", "Votre demande de club a été envoyée avec succès.");
          setShowRequest(false);
          setRequestName("");
          setRequestCity("");
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible d'envoyer la demande.");
        },
      }
    );
  };

  const renderOrg = ({ item }: { item: Organization }) => {
    const isSelected = item.id === selectedId;
    return (
      <Pressable
        onPress={() => handleOrgPress(item)}
        style={({ pressed }) => [
          styles.orgRow,
          { borderBottomColor: semanticColors.divider[scheme] },
          pressed ? { opacity: 0.6 } : undefined,
        ]}
      >
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.orgLogo} contentFit="cover" />
        ) : (
          <View style={styles.orgLogoPlaceholder}>
            <Building2 size={18} color={colors.accentGreen} strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.orgInfo}>
          <Text
            style={[styles.orgName, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.address && (
            <Text
              style={[styles.orgAddress, { color: semanticColors.labelSecondary[scheme] }]}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          )}
        </View>
        {item.pinEnabled && (
          <Lock size={16} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
        )}
        {isSelected && (
          <View style={styles.selectedDot} />
        )}
      </Pressable>
    );
  };

  // PIN entry sub-view
  if (pinOrg) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView
          style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        >
          <View style={styles.header}>
            <Pressable onPress={() => setPinOrg(null)}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Code PIN requis
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.pinContent}>
            <Text style={[styles.pinDescription, { color: semanticColors.labelSecondary[scheme] }]}>
              Le club "{pinOrg.name}" est protégé par un code PIN. Demandez-le à votre club.
            </Text>
            <FormField
              label="Code PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              placeholder="Entrez le PIN"
              maxLength={6}
            />
            <Pressable
              onPress={handlePinSubmit}
              disabled={pin.length < 4 || verifyPin.isPending}
              style={[
                styles.submitButton,
                { opacity: pin.length < 4 || verifyPin.isPending ? 0.5 : 1 },
              ]}
            >
              {verifyPin.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Valider</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Club request sub-view
  if (showRequest) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView
          style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        >
          <View style={styles.header}>
            <Pressable onPress={() => setShowRequest(false)}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Proposer un club
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.pinContent}>
            <FormField
              label="Nom du club"
              value={requestName}
              onChangeText={setRequestName}
              placeholder="Ex: Tennis Club de Paris"
            />
            <FormField
              label="Ville"
              value={requestCity}
              onChangeText={setRequestCity}
              placeholder="Ex: Paris"
            />
            <Pressable
              onPress={handleRequestSubmit}
              disabled={
                !requestName.trim() || !requestCity.trim() || requestClub.isPending
              }
              style={[
                styles.submitButton,
                {
                  opacity:
                    !requestName.trim() || !requestCity.trim() || requestClub.isPending
                      ? 0.5
                      : 1,
                },
              ]}
            >
              {requestClub.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer la demande</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onDismiss}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Sélectionner un club
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: semanticColors.cardBackground[scheme],
                borderColor: semanticColors.borderColor[scheme],
              },
            ]}
          >
            <Search size={18} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un club..."
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              style={[styles.searchInput, { color: semanticColors.labelPrimary[scheme] }]}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={16} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
              </Pressable>
            )}
          </View>

          {/* Results */}
          <FlatList
            data={organizations}
            keyExtractor={(item) => item.id}
            renderItem={renderOrg}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              isLoading ? (
                <ActivityIndicator style={styles.loader} color={colors.accentGreen} />
              ) : (
                <Text
                  style={[
                    styles.emptyText,
                    { color: semanticColors.labelSecondary[scheme] },
                  ]}
                >
                  Aucun club trouvé
                </Text>
              )
            }
            ListFooterComponent={
              <Pressable
                onPress={() => setShowRequest(true)}
                style={({ pressed }) => [
                  styles.requestRow,
                  pressed ? { opacity: 0.6 } : undefined,
                ]}
              >
                <Text style={styles.requestText}>Proposer mon club</Text>
                <ChevronRight size={16} color={colors.accentGreen} strokeWidth={2} />
              </Pressable>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.horizontal,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 0.5,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  listContent: {
    paddingHorizontal: spacing.horizontal,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orgLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  orgLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${colors.accentGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  orgInfo: {
    flex: 1,
    gap: 2,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "500",
  },
  orgAddress: {
    fontSize: 13,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentGreen,
  },
  loader: {
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 32,
    fontSize: 15,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 4,
  },
  requestText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.accentGreen,
  },
  pinContent: {
    padding: spacing.horizontal,
    gap: 16,
  },
  pinDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  submitButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
