import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { GlassView } from "expo-glass-effect";
import { Search, X, Building2, Lock, ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchOrganizations, useVerifyPin, useRequestClub } from "@/hooks/use-organization";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { FormField } from "@/components/ui/form-field";
import { setPendingClubSelection } from "@/lib/pending-club-selection";
import type { Organization } from "@/types/organization";

export default function ClubSelection() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { selectedId } = useLocalSearchParams<{ selectedId?: string }>();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [pinOrg, setPinOrg] = useState<Organization | null>(null);
  const [pin, setPin] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestCity, setRequestCity] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const handleSelect = (org: Organization, orgPin?: string) => {
    setPendingClubSelection({ organization: org, pin: orgPin });
    router.back();
  };

  const handleOrgPress = (org: Organization) => {
    if (org.pinEnabled) {
      setPinOrg(org);
      setPin("");
    } else {
      handleSelect(org);
    }
  };

  const handlePinSubmit = () => {
    if (!pinOrg) return;
    verifyPin.mutate(
      { organizationId: pinOrg.id, pin },
      {
        onSuccess: (result) => {
          if (result.valid) {
            handleSelect(pinOrg!, pin);
          } else {
            Alert.alert("PIN incorrect", "Le code PIN est invalide.");
          }
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible de verifier le PIN.");
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
          Alert.alert("Demande envoyee", "Votre demande de club a ete envoyee avec succes.");
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
          styles.orgCardWrapper,
          pressed && styles.orgCardPressed,
        ]}
      >
        <GlassView style={styles.orgCard}>
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
          {isSelected && <View style={styles.selectedDot} />}
        </GlassView>
      </Pressable>
    );
  };

  if (pinOrg) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Code PIN requis",
            headerLeft: () => (
              <Pressable onPress={() => setPinOrg(null)} hitSlop={8}>
                <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
              </Pressable>
            ),
          }}
        />
        <View style={[styles.pinContent, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <Text style={[styles.pinDescription, { color: semanticColors.labelSecondary[scheme] }]}>
            Le club "{pinOrg.name}" est protege par un code PIN. Demandez-le a votre club.
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
      </>
    );
  }

  if (showRequest) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Proposer un club",
            headerLeft: () => (
              <Pressable onPress={() => setShowRequest(false)} hitSlop={8}>
                <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
              </Pressable>
            ),
          }}
        />
        <View style={[styles.pinContent, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
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
            disabled={!requestName.trim() || !requestCity.trim() || requestClub.isPending}
            style={[
              styles.submitButton,
              {
                opacity:
                  !requestName.trim() || !requestCity.trim() || requestClub.isPending ? 0.5 : 1,
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
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />

      <FlatList
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        data={organizations}
        keyExtractor={(item) => item.id}
        renderItem={renderOrg}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} color={colors.accentGreen} />
          ) : (
            <Text
              style={[styles.emptyText, { color: semanticColors.labelSecondary[scheme] }]}
            >
              Aucun club trouve
            </Text>
          )
        }
        ListHeaderComponent={
          <GlassView style={styles.searchContainer}>
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
          </GlassView>
        }
        ListFooterComponent={
          <Pressable
            onPress={() => setShowRequest(true)}
            style={({ pressed }) => [
              styles.requestRow,
              pressed && styles.orgCardPressed,
            ]}
          >
            <Text style={styles.requestText}>Proposer mon club</Text>
            <ChevronRight size={16} color={colors.accentGreen} strokeWidth={2} />
          </Pressable>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: radii.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  listContent: {
    paddingHorizontal: spacing.horizontal,
    gap: 8,
    paddingTop: 4,
  },
  orgCardWrapper: {
    borderRadius: radii.md,
  },
  orgCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  orgCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: radii.md,
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
    flex: 1,
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
