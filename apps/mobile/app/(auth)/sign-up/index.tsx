import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { colors } from "@/constants/theme";
import { EmailAuthForm } from "@/features/auth/components/email-auth-form";

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#B5502A", "#B5502A", "#6B2E18", "#1C0C08"]}
      locations={[0, 0.45, 0.75, 1]}
      style={styles.container}
    >
      <View style={[styles.spacer, { paddingTop: insets.top }]} />

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/aceclub-logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.appName}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Rejoins Ace Club avec ton adresse email
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bottomSection}>
        <EmailAuthForm mode="sign-up" />

        <Pressable
          onPress={() => router.push("/sign-in")}
          hitSlop={8}
          style={styles.signInLink}
        >
          <Text style={styles.signInLinkText}>
            Déjà un compte ? Se connecter
          </Text>
        </Pressable>

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
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  signInLink: {
    alignItems: "center",
    marginTop: 16,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textDecorationLine: "underline",
  },
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
