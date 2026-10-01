import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { authClient } from "@/lib/auth-client";
import { onboardingColors } from "@/features/onboarding/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Adresse email invalide");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Never reveals whether the account exists — same message either way.
      await authClient.requestPasswordReset({ email: trimmed, redirectTo: "aceclub://reset-password" });
      setSent(true);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <ChevronLeft size={22} color={onboardingColors.fg} strokeWidth={2.5} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Mot de passe oublié</Text>

        {sent ? (
          <Text style={styles.subtitle}>
            Si un compte existe avec cette adresse, un email de réinitialisation vient de t&apos;être envoyé.
          </Text>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Indique l&apos;email de ton compte, on t&apos;envoie un lien pour choisir un nouveau mot de passe.
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
          </>
        )}
      </View>

      {!sent && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={onboardingColors.accentForeground} />
            ) : (
              <Text style={styles.buttonText}>Envoyer le lien</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
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
