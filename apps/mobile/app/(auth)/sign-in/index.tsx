import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { authClient } from "@/lib/auth-client";
import { colors, radii, spacing, sizes } from "@/constants/theme";
import GoogleLogo from "@/features/auth/components/google-logo";

const __DEV__ = process.env.NODE_ENV === "development";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev-only email/password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({ provider: "apple" });
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
      await authClient.signIn.social({ provider: "google" });
    } catch {
      setError("Une erreur est survenue avec Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Email ou mot de passe incorrect");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Spacer top */}
      <View style={styles.spacer} />

      {/* Hero section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/aceclub-logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <View style={styles.welcomeText}>
          <Text style={styles.title}>Bienvenue sur AceClub</Text>
          <Text style={styles.subtitle}>
            Trouve des partenaires, organise tes matchs et rejoins ta
            communaute.
          </Text>
        </View>
      </View>

      {/* Spacer middle */}
      <View style={styles.spacer} />

      {/* Sign in buttons */}
      <View style={styles.buttonsContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Apple Sign-In (iOS only) */}
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radii.sm}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        {/* Google Sign-In */}
        <Pressable onPress={handleGoogleSignIn} disabled={isLoading}>
          <View style={styles.googleButton}>
            <GoogleLogo size={18} />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </View>
        </Pressable>

        {/* Dev-only: Email/Password */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <View style={styles.devDivider}>
              <View style={styles.devDividerLine} />
              <Text style={styles.devDividerText}>DEV</Text>
              <View style={styles.devDividerLine} />
            </View>
            <TextInput
              style={styles.devInput}
              placeholder="Email"
              placeholderTextColor={colors.gray400}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.devInput}
              placeholder="Mot de passe"
              placeholderTextColor={colors.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Pressable onPress={handleEmailSignIn} disabled={isLoading}>
              <View style={styles.devButton}>
                <Text style={styles.devButtonText}>Se connecter (dev)</Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>En continuant, tu acceptes nos</Text>
        <View style={styles.footerLinks}>
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync("https://ace-club.app/terms")
            }
            hitSlop={12}
          >
            <Text style={styles.linkText}>Conditions d'utilisation</Text>
          </Pressable>
          <Text style={styles.footerText}> et </Text>
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync("https://ace-club.app/privacy")
            }
            hitSlop={12}
          >
            <Text style={styles.linkText}>Politique de confidentialite</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  spacer: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    gap: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.horizontal,
    gap: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.red50,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  errorText: {
    color: colors.red500,
    fontSize: 12,
  },
  appleButton: {
    width: "100%",
    height: sizes.buttonHeight,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: sizes.buttonHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
  },
  // Dev section
  devSection: {
    gap: 10,
    marginTop: 4,
  },
  devDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  devDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  devDividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accentOrange,
  },
  devInput: {
    height: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.black,
    backgroundColor: colors.gray50,
  },
  devButton: {
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.accentOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  devButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray400,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: colors.accentGreen,
  },
});
