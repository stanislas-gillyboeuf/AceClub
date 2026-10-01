import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { X, MailWarning } from "lucide-react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";

/**
 * Non-blocking nudge for accounts that predate email verification (or just haven't gotten to it
 * yet) — never forces anyone through /verify-email, just offers it. Dismiss isn't persisted: it
 * comes back on the next app launch until the email is actually verified. See the Étape 3 plan's
 * "stratégie comptes existants" — a stricter, blocking version is deliberately not built yet.
 */
export function VerifyEmailPrompt() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !session?.user || session.user.emailVerified) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.systemGray6[scheme], borderColor: semanticColors.borderColor[scheme] },
      ]}
    >
      <MailWarning size={20} color={colors.accentOrange} strokeWidth={2} />
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>Vérifie ton email</Text>
        <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
          Confirme ton adresse pour sécuriser ton compte.
        </Text>
      </View>
      <Pressable onPress={() => router.push("/verify-email")} hitSlop={8}>
        <Text style={styles.action}>Vérifier</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
        <X size={16} color={semanticColors.labelTertiary[scheme]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 12.5,
  },
  action: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accentGreen,
  },
});
