import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Lock } from "lucide-react-native";
import { organizationService } from "@/services/organization";
import { onboardingColors } from "@/features/onboarding/theme";
import type { Organization } from "@/types/organization";

const ROW_HEIGHT = 72;
const SEARCH_DEBOUNCE_MS = 300;

/** First screen of the join-a-club flow (Étape 4) — reached from run-reconciliation.ts when no
 * CSV-imported profile matched the verified email. Separate from club-selection.tsx/club-step.tsx,
 * which stay as-is for the "change club from settings" flow (update-profile.ts). */
export default function FindClubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      organizationService
        .searchOrganizations(query.trim() || undefined)
        .then((res) => setOrganizations(res.organizations))
        .catch(() => setOrganizations([]))
        .finally(() => setIsLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (org: Organization) => {
    if (org.pinEnabled) {
      router.push({ pathname: "/club-code", params: { organizationId: org.id, name: org.name } });
      return;
    }

    setJoiningId(org.id);
    setError(null);
    try {
      await organizationService.join(org.id);
      router.replace("/");
    } catch {
      setError("Impossible de rejoindre ce club. Réessaie.");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Trouve ton club</Text>
        <View style={styles.searchBox}>
          <Search size={18} color={onboardingColors.fgDim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nom ou ville"
            placeholderTextColor={onboardingColors.fgDim}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={onboardingColors.accent} />
      ) : (
        <FlatList
          data={organizations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun club trouvé.</Text>}
          renderItem={({ item }) => {
            const isJoining = joiningId === item.id;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                disabled={joiningId !== null}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.address && (
                    <Text style={styles.rowAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  )}
                </View>
                {isJoining ? (
                  <ActivityIndicator color={onboardingColors.accent} />
                ) : item.pinEnabled ? (
                  <View style={styles.pillLocked}>
                    <Lock size={12} color={onboardingColors.fgDim} />
                    <Text style={styles.pillLockedText}>Code requis</Text>
                  </View>
                ) : (
                  <View style={styles.pillOpen}>
                    <Text style={styles.pillOpenText}>Rejoindre</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: onboardingColors.fg,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: onboardingColors.fg,
    fontSize: 13,
    textAlign: "center",
  },
  loader: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
    color: onboardingColors.fgDim,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: onboardingColors.cardBorder,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  rowAddress: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
  pillLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pillLockedText: {
    fontSize: 12,
    fontWeight: "600",
    color: onboardingColors.fgDim,
  },
  pillOpen: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: onboardingColors.accent,
  },
  pillOpenText: {
    fontSize: 13,
    fontWeight: "700",
    color: onboardingColors.accentForeground,
  },
});
