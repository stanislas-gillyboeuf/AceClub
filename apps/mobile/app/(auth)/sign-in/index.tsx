import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@/lib/google-signin";
import { authClient } from "@/lib/auth-client";
import { colors, radii } from "@/constants/theme";
import GoogleLogo from "@/features/auth/components/google-logo";
import { EmailAuthForm } from "@/features/auth/components/email-auth-form";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Google Sign-In is temporarily disabled on Android (OAuth/SHA-1 config issue
  // being resolved on the Google Cloud / Play Console side) — email is the only
  // option there for now, so skip the toggle and show the form right away.
  const [showEmailForm, setShowEmailForm] = useState(Platform.OS !== "ios");

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError("Impossible de récupérer le token Apple");
        return;
      }
      await authClient.signIn.social({
        provider: "apple",
        idToken: {
          token: credential.identityToken,
        },
      });
      // Apple provides fullName only on first sign-in — update user name (fire-and-forget)
      const givenName = credential.fullName?.givenName;
      const familyName = credential.fullName?.familyName;
      if (givenName || familyName) {
        const fullName = [givenName, familyName].filter(Boolean).join(" ");
        authClient.updateUser({ name: fullName }).catch(console.warn);
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        setError("Une erreur est survenue avec Apple Sign-In");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) {
        setError("Impossible de récupérer le token Google");
        return;
      }
      await authClient.signIn.social({
        provider: "google",
        idToken: {
          token: idToken,
        },
      });
    } catch (e: any) {
      console.error("Google Sign-In error:", JSON.stringify(e, null, 2), e);
      if (e.code !== "SIGN_IN_CANCELLED") {
        setError(e.message || "Une erreur est survenue avec Google Sign-In");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        "#B5502A",
        "#B5502A",
        "#6B2E18",
        "#1C0C08",
      ]}
      locations={[0, 0.45, 0.75, 1]}
      style={styles.container}
    >
      {/* Spacer top */}
      <View style={[styles.spacer, { paddingTop: insets.top }]} />

      {/* Hero section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/aceclub-logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.appName}>Ace Club</Text>
        <Text style={styles.subtitle}>
          Ton compagnon pour le tennis{"\n"}et le padel
        </Text>
      </View>

      {/* Spacer middle */}
      <View style={styles.spacer} />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Sign-in pills — Apple and Google are iOS-only for now (Google Sign-In
            is disabled on Android until its OAuth config is fixed) */}
        {Platform.OS === "ios" && (
          <View style={styles.pillsRow}>
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.pill,
                pressed && styles.pillPressed,
              ]}
            >
              <Ionicons name="logo-apple" size={20} color={colors.black} />
              <Text style={styles.pillText}>Apple</Text>
            </Pressable>

            <Pressable
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.pill,
                pressed && styles.pillPressed,
              ]}
            >
              <GoogleLogo size={18} />
              <Text style={styles.pillText}>Google</Text>
            </Pressable>
          </View>
        )}

        {/* Email/password */}
        {showEmailForm ? (
          <View style={styles.emailSection}>
            <EmailAuthForm mode="sign-in" />
            <Pressable
              onPress={() => router.push("/sign-up")}
              hitSlop={8}
              style={styles.emailToggle}
            >
              <Text style={styles.emailToggleText}>
                Pas de compte ? Créer un compte
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowEmailForm(true)}
            hitSlop={8}
            style={styles.emailToggle}
          >
            <Text style={styles.emailToggleText}>
              Se connecter avec un email
            </Text>
          </Pressable>
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.footerText}>En continuant, tu acceptes nos</Text>
          <View style={styles.footerLinks}>
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync("https://ace-club.app/terms")
              }
              hitSlop={12}
            >
              <Text style={styles.linkText}>CGU</Text>
            </Pressable>
            <Text style={styles.footerText}> et </Text>
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync("https://ace-club.app/privacy")
              }
              hitSlop={12}
            >
              <Text style={styles.linkText}>Politique de confidentialité</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
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
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.white,
    fontSize: 13,
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 12,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 26,
    gap: 10,
  },
  pillPressed: {
    opacity: 0.85,
  },
  pillText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  // Email sign-in
  emailSection: {
    gap: 12,
    marginTop: 16,
  },
  emailToggle: {
    alignItems: "center",
    marginTop: 16,
  },
  emailToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textDecorationLine: "underline",
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textDecorationLine: "underline",
  },
});
