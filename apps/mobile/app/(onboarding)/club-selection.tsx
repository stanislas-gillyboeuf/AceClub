import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { GlassView } from "@/components/ui/glass-view";
import { Search, X, MapPin, Lock } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchOrganizations, useRequestClub } from "@/hooks/use-organization";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { FormField } from "@/components/ui/form-field";
import { setPendingClubSelection } from "@/lib/pending-club-selection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Button from "@/components/ui/button";
import type { Organization } from "@/types/organization";

export default function OnboardingClubSelection() {
  const scheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestCity, setRequestCity] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: searchData, isLoading } = useSearchOrganizations(
    debouncedQuery || undefined,
    20,
    offset
  );
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
    handleSelect(org);
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

  const renderOrg = ({ item, index }: { item: Organization; index: number }) => {
    return (
      <Animated.View entering={FadeIn.delay(Math.min(index * 50, 300)).duration(300)}>
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
                <Text style={styles.orgLogoLetter}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.orgInfo}>
              <Text
                style={[styles.orgName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.address ? (
                <View style={styles.orgAddressRow}>
                  <MapPin size={12} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                  <Text
                    style={[styles.orgAddress, { color: semanticColors.labelSecondary[scheme] }]}
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.orgSubtitle, { color: semanticColors.labelSecondary[scheme] }]}>
                  Club
                </Text>
              )}
            </View>
            {item.pinEnabled && (
              <Lock size={14} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
            )}
          </GlassView>
        </Pressable>
      </Animated.View>
    );
  };

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
        <ScrollView
          style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
          contentContainerStyle={styles.requestContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.requestDescription, { color: semanticColors.labelSecondary[scheme] }]}>
            Renseigne le nom et la ville de ton club. On l'ajoutera dans les plus brefs delais.
          </Text>
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
          <Button
            label="Envoyer la demande"
            onPress={handleRequestSubmit}
            disabled={!requestName.trim() || !requestCity.trim()}
            loading={requestClub.isPending}
          />
        </ScrollView>
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
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} color={colors.accentGreen} />
          ) : debouncedQuery.length > 0 ? (
            <Animated.View entering={FadeIn.duration(350)} style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Search size={32} color={colors.accentGreen} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Aucun club trouve
              </Text>
              <Text style={[styles.emptySubtitle, { color: semanticColors.labelSecondary[scheme] }]}>
                Essaie avec un autre nom ou propose ton club ci-dessous.
              </Text>
            </Animated.View>
          ) : null
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
          <View style={styles.fixedFooter}>
            <Button
              label="Proposer mon club"
              onPress={() => setShowRequest(true)}
            />
          </View>
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  orgLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  orgLogoLetter: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  orgInfo: {
    flex: 1,
    gap: 2,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "600",
  },
  orgSubtitle: {
    fontSize: 13,
  },
  orgAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orgAddress: {
    fontSize: 13,
    flex: 1,
  },
  loader: {
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accentGreen}12`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
  },
  fixedFooter: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 12,
  },
  requestContent: {
    padding: spacing.horizontal,
    gap: 16,
  },
  requestDescription: {
    fontSize: 15,
    lineHeight: 21,
  },
});
