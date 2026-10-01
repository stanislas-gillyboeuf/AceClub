import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { onboardingColors } from "@/features/onboarding/theme";
import { OtpCodeInput } from "@/features/auth/components/otp-code-input";
import { runReconciliation } from "@/features/auth/lib/run-reconciliation";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Generic OTP screen for both cases:
 *  - mode "verify" (default): verifies the session's own email (email/password sign-up).
 *  - mode "change": verifies+promotes `email` param to become the login email (Apple relay users
 *    confirming the real address typed on /apple-email).
 */
export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { email: emailParam, mode = "verify", backTo = "/sign-up" } = useLocalSearchParams<{
    email?: string;
    mode?: "verify" | "change";
    backTo?: string;
  }>();
  const email = emailParam ?? session?.user.email ?? "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const sendCode = async () => {
    setError(null);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      if (mode === "change") {
        await authClient.emailOtp.requestEmailChange({ newEmail: email });
      } else {
        await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      }
    } catch {
      setError("Impossible d'envoyer le code. Réessaie.");
    }
  };

  useEffect(() => {
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (otp: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      if (mode === "change") {
        const res = await authClient.emailOtp.changeEmail({ newEmail: email, otp });
        if (res.error) {
          setError(res.error.message ?? "Code invalide");
          return;
        }
      } else {
        const res = await authClient.emailOtp.verifyEmail({ email, otp });
        if (res.error) {
          setError(res.error.message ?? "Code invalide");
          return;
        }
      }
      await runReconciliation(router);
    } catch {
      setError("Code invalide ou expiré");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeCode = (value: string) => {
    setCode(value);
    if (value.length === CODE_LENGTH) {
      handleVerify(value);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Vérifie ton email</Text>
        <Text style={styles.subtitle}>
          On a envoyé un code à 6 chiffres à{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.codeWrap}>
          <OtpCodeInput length={CODE_LENGTH} value={code} onChange={handleChangeCode} autoFocus />
          {isVerifying && <ActivityIndicator style={styles.loader} color={onboardingColors.accent} />}
        </View>

        <Pressable onPress={sendCode} disabled={cooldown > 0} hitSlop={8} style={styles.resendButton}>
          <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
            {cooldown > 0 ? `Renvoyer le code dans ${cooldown} s` : "Renvoyer le code"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace(backTo)} hitSlop={8} style={styles.editButton}>
          <Text style={styles.editText}>Modifier mon email</Text>
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
  email: {
    fontWeight: "700",
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
  codeWrap: {
    alignItems: "center",
    gap: 16,
  },
  loader: {
    marginTop: 4,
  },
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: onboardingColors.fg,
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: onboardingColors.fgDim,
    textDecorationLine: "none",
  },
  editButton: {
    alignItems: "center",
  },
  editText: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
});
