import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { userService } from "@/services/user";
import { onboardingColors } from "@/features/onboarding/theme";
import type { ImportedProfile } from "@/types/user";

function formatAge(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null;
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} ans`;
}

/** Shown when several CSV-imported profiles share the just-verified email (typically a parent's
 * address also used for their children) — see features/auth/lib/run-reconciliation.ts. */
export default function ReconcileChooseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ImportedProfile[] | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .findImportedProfiles()
      .then((res) => setProfiles(res.profiles))
      .catch(() => setProfiles([]));
  }, []);

  const handleChoose = async (profile: ImportedProfile) => {
    setClaimingId(profile.userId);
    setError(null);
    try {
      await userService.claimProfile(profile.userId, profile.organizationId);
      router.replace("/");
    } catch {
      setError("Impossible de rattacher ce profil. Réessaie.");
      setClaimingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>C&apos;est qui, toi ?</Text>
        <Text style={styles.subtitle}>Cette adresse email est utilisée par plusieurs profils.</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {profiles === null ? (
        <ActivityIndicator style={styles.loader} color={onboardingColors.accent} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => `${item.userId}-${item.organizationId}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const age = formatAge(item.dateOfBirth);
            const isClaiming = claimingId === item.userId;
            return (
              <Pressable
                onPress={() => handleChoose(item)}
                disabled={claimingId !== null}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowSubtitle}>
                    {item.organizationName}
                    {age ? ` · ${age}` : ""}
                  </Text>
                </View>
                {isClaiming ? (
                  <ActivityIndicator color={onboardingColors.accent} />
                ) : (
                  <ChevronRight size={18} color={onboardingColors.fgDim} />
                )}
              </Pressable>
            );
          }}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={() => router.replace("/")} hitSlop={8} style={styles.skipLink}>
          <Text style={styles.skipText}>Aucun de ces profils · en choisir un autre club</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: onboardingColors.fgDim,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
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
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
  },
  rowPressed: {
    opacity: 0.85,
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
  rowSubtitle: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipLink: {
    alignItems: "center",
  },
  skipText: {
    fontSize: 13,
    color: onboardingColors.fgDim,
    textDecorationLine: "underline",
  },
});
