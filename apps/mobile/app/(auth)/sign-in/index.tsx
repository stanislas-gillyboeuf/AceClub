import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { authClient } from "@/lib/auth-client";
import { onboardingColors } from "@/features/onboarding/theme";
import AppleButton from "@/features/auth/components/apple-button";
import GoogleButton from "@/features/auth/components/google-button";
import { LegalFooter } from "@/features/auth/components/legal-footer";
import { EmailAuthForm } from "@/features/auth/components/email-auth-form";
import { runReconciliation } from "@/features/auth/lib/run-reconciliation";

const APPLE_RELAY_EMAIL_SUFFIX = "privaterelay.appleid.com";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async (credential: AppleAuthentication.AppleAuthenticationCredential) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!credential.identityToken) {
        setError("Impossible de récupérer le token Apple");
        return;
      }
      await authClient.signIn.social({
        provider: "apple",
        idToken: { token: credential.identityToken },
      });
      // Apple provides fullName only on first sign-in — update user name (fire-and-forget)
      const givenName = credential.fullName?.givenName;
      const familyName = credential.fullName?.familyName;
      if (givenName || familyName) {
        const fullName = [givenName, familyName].filter(Boolean).join(" ");
        authClient.updateUser({ name: fullName }).catch(console.warn);
      }
      // Apple can mask the real address behind a relay — ask for it once, remembered afterward.
      const { data: session } = await authClient.getSession();
      if (session?.user.email?.endsWith(APPLE_RELAY_EMAIL_SUFFIX) && !session.user.contactEmail) {
        router.push("/apple-email");
        return;
      }
      await runReconciliation(router);
    } catch {
      setError("Une erreur est survenue avec Apple Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google", idToken: { token: idToken } });
      await runReconciliation(router);
    } catch {
      setError("Une erreur est survenue avec Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg }]}>
      <View style={[styles.spacer, { paddingTop: insets.top }]} />

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/aceclub-logo.png")} style={styles.logo} resizeMode="cover" />
        </View>
        <Text style={styles.appName}>Ace Club</Text>
        <Text style={styles.subtitle}>La vie de ton club, dans ta poche.</Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bottomSection}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {Platform.OS === "ios" && (
          <>
            <View style={styles.socialButtons}>
              <AppleButton
                onSignIn={handleAppleSignIn}
                onError={() => setError("Une erreur est survenue avec Apple Sign-In")}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={16}
                height={56}
                disabled={isLoading}
              />
              <GoogleButton
                onSignIn={handleGoogleSignIn}
                onError={() => setError("Une erreur est survenue avec Google Sign-In")}
                disabled={isLoading}
              />
            </View>

            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou avec ton email</Text>
              <View style={styles.separatorLine} />
            </View>
          </>
        )}

        <View style={styles.emailSection}>
          <EmailAuthForm mode="sign-in" />

          <Pressable onPress={() => router.push("/forgot-password")} hitSlop={8} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/sign-up")} hitSlop={8} style={styles.signUpLink}>
            <Text style={styles.signUpLinkText}>Pas encore de compte ? Créer mon compte</Text>
          </Pressable>
        </View>

        <LegalFooter paddingBottom={insets.bottom + 8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    gap: 8,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: onboardingColors.fg,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: onboardingColors.fgDim,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: onboardingColors.fg,
    fontSize: 13,
    textAlign: "center",
  },
  socialButtons: {
    gap: 12,
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: onboardingColors.cardBorder,
  },
  separatorText: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
  emailSection: {
    gap: 12,
  },
  forgotPassword: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: onboardingColors.fgDim,
  },
  signUpLink: {
    alignItems: "center",
    marginTop: 8,
  },
  signUpLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: onboardingColors.fg,
    textDecorationLine: "underline",
  },
});
