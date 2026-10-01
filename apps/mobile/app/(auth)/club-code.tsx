import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/lib/api";
import { organizationService } from "@/services/organization";
import { onboardingColors } from "@/features/onboarding/theme";

function friendlyMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      // Not JSON — fall through to the generic fallback below.
    }
  }
  return fallback;
}

/** "Ce club demande un code" — reached from find-club.tsx when the selected club has
 * `pinEnabled`. One plain text field, not digit boxes: a club PIN has no fixed length client
 * side (unlike the 6-digit email OTP in verify-email.tsx). */
export default function ClubCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { organizationId, name } = useLocalSearchParams<{ organizationId: string; name: string }>();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await organizationService.join(organizationId, code.trim());
      router.replace("/");
    } catch (e) {
      setError(friendlyMessage(e, "Impossible de rejoindre ce club."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Ce club demande un code</Text>
        <Text style={styles.subtitle}>{name ? `Entre le code fourni par ${name}.` : "Entre le code de ton club."}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="CODE"
          placeholderTextColor={onboardingColors.fgDim}
          style={styles.codeInput}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isLoading || !code.trim()}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            (isLoading || !code.trim()) && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={onboardingColors.accentForeground} />
          ) : (
            <Text style={styles.buttonText}>Rejoindre mon club</Text>
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
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: onboardingColors.fg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: onboardingColors.fgDim,
    textAlign: "center",
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
  codeInput: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    backgroundColor: onboardingColors.cardBg,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 6,
    color: onboardingColors.fg,
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
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: onboardingColors.accentForeground,
  },
});
