import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user";
import { onboardingColors } from "@/features/onboarding/theme";
import type { ImportedProfile } from "@/types/user";

/** Shown when exactly one CSV-imported profile matches the just-verified email — see
 * features/auth/lib/run-reconciliation.ts. */
export default function ReconcileWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<ImportedProfile | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .findImportedProfiles()
      .then(({ profiles }) => setProfile(profiles[0] ?? null))
      .catch(() => setProfile(null));
  }, []);

  const firstName = profile?.name.split(" ")[0] ?? "";

  const handleConfirm = async () => {
    if (!profile) return;
    setIsClaiming(true);
    setError(null);
    try {
      await userService.claimProfile(profile.userId, profile.organizationId);
      router.replace("/");
    } catch {
      setError("Impossible de rattacher ce profil. Réessaie.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
        <ActivityIndicator style={styles.loader} color={onboardingColors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue {firstName}</Text>
        <Text style={styles.subtitle}>On a retrouvé ton profil chez {profile.organizationName}.</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Row label="Nom" value={profile.name} />
          <Row label="Email" value={session?.user.email ?? ""} />
          {profile.licenseNumber && <Row label="Licence" value={profile.licenseNumber} />}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleConfirm}
          disabled={isClaiming}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isClaiming && styles.buttonDisabled]}
        >
          {isClaiming ? (
            <ActivityIndicator color={onboardingColors.accentForeground} />
          ) : (
            <Text style={styles.buttonText}>C&apos;est moi, continuer</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.replace("/")} hitSlop={8} style={styles.skipLink}>
          <Text style={styles.skipText}>Ce n&apos;est pas mon club · en choisir un autre</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 20,
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
  },
  errorText: {
    color: onboardingColors.fg,
    fontSize: 13,
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: onboardingColors.fg,
    flexShrink: 1,
    textAlign: "right",
  },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: onboardingColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: onboardingColors.accentForeground,
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
