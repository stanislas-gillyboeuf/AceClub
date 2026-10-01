import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { onboardingColors } from "@/features/onboarding/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shown right after an Apple sign-in whose email turned out to be a privaterelay alias —
 * see the exception in app/(auth)/_layout.tsx. Stores the real email in `user.contactEmail`,
 * separate from the login identity. */
export default function AppleEmailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Adresse email invalide");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.updateUser({ contactEmail: trimmed });
      if (res.error) {
        setError(res.error.message ?? "Impossible d'enregistrer cet email");
        return;
      }
      // Verifying this email (next screen) also promotes it to the login email — see the
      // emailOTP "change-email" config in services/api/auth.ts.
      router.replace({
        pathname: "/verify-email",
        params: { email: trimmed, mode: "change", backTo: "/apple-email" },
      });
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Ajoute ton email</Text>
        <Text style={styles.subtitle}>
          Apple peut masquer ton adresse. Pour retrouver ton profil, on a besoin de l&apos;email que tu as
          donné à ton club.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={onboardingColors.fgDim}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoFocus
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color={onboardingColors.accentForeground} />
          ) : (
            <Text style={styles.buttonText}>Continuer</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
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
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    paddingHorizontal: 16,
    fontSize: 15,
    color: onboardingColors.fg,
    backgroundColor: onboardingColors.cardBg,
  },
  footer: {
    paddingHorizontal: 24,
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
});
