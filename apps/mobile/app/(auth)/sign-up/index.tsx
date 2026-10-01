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

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async (credential: AppleAuthentication.AppleAuthenticationCredential) => {
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
      const givenName = credential.fullName?.givenName;
      const familyName = credential.fullName?.familyName;
      if (givenName || familyName) {
        const fullName = [givenName, familyName].filter(Boolean).join(" ");
        authClient.updateUser({ name: fullName }).catch(console.warn);
      }
      const { data: session } = await authClient.getSession();
      if (session?.user.email?.endsWith(APPLE_RELAY_EMAIL_SUFFIX) && !session.user.contactEmail) {
        router.push("/apple-email");
        return;
      }
      // Already a real, provider-verified email — no OTP screen needed.
      await runReconciliation(router);
    } catch {
      setError("Une erreur est survenue avec Apple Sign-In");
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google", idToken: { token: idToken } });
      await runReconciliation(router);
    } catch {
      setError("Une erreur est survenue avec Google Sign-In");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: onboardingColors.bg }]}>
      <View style={[styles.spacer, { paddingTop: insets.top }]} />

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/aceclub-logo.png")} style={styles.logo} resizeMode="cover" />
        </View>
        <Text style={styles.appName}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoins Ace Club avec ton adresse email</Text>
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
              />
              <GoogleButton
                onSignIn={handleGoogleSignIn}
                onError={() => setError("Une erreur est survenue avec Google Sign-In")}
              />
            </View>

            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou avec ton email</Text>
              <View style={styles.separatorLine} />
            </View>
          </>
        )}

        <EmailAuthForm
          mode="sign-up"
          onSignUpSuccess={(email) =>
            router.replace({
              pathname: "/verify-email",
              params: { email, mode: "verify", backTo: "/sign-up" },
            })
          }
        />

        <Pressable onPress={() => router.push("/sign-in")} hitSlop={8} style={styles.signInLink}>
          <Text style={styles.signInLinkText}>Déjà un compte ? Se connecter</Text>
        </Pressable>

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
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  logo: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: onboardingColors.fg,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: onboardingColors.fgDim,
    textAlign: "center",
    lineHeight: 20,
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
  signInLink: {
    alignItems: "center",
    marginTop: 16,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: onboardingColors.fg,
    textDecorationLine: "underline",
  },
});
