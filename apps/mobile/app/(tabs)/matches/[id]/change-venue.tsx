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
import { Search, X, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchOrganizations } from "@/hooks/use-organization";
import { useMatch, useUpdateVenue } from "@/hooks/use-match";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { Organization } from "@/types/organization";

export default function ChangeVenueSheet() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: matchDetail } = useMatch(id);
  const currentVenueId = matchDetail?.venueOrganization?.id ?? null;

  const updateVenue = useUpdateVenue();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const { data: searchData, isLoading } = useSearchOrganizations(
    debouncedQuery || undefined,
    20,
    0
  );
  const organizations = searchData?.organizations ?? [];

  const handleSelect = (org: Organization) => {
    if (!id || org.id === currentVenueId) {
      router.back();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateVenue.mutate(
      { id, venueOrganizationId: org.id },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Erreur", "Impossible de changer le lieu."),
      }
    );
  };

  const renderOrg = ({ item }: { item: Organization }) => {
    const isSelected = item.id === currentVenueId;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
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
              <Text style={styles.orgLogoLetter}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
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
          {isSelected && (
            <Check size={18} color={colors.accentGreen} strokeWidth={2.5} />
          )}
        </GlassView>
      </Pressable>
    );
  };

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
              Aucun club trouvé
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
    borderRadius: 20,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  orgLogoLetter: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accentGreen,
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
  loader: {
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 32,
    fontSize: 15,
  },
});
