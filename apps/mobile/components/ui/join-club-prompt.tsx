import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { UsersRound } from "lucide-react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Shown instead of an empty list when the player belongs to no club — this
 * screen's content is always club-scoped server-side, so there is nothing to
 * fall back to.
 */
export function JoinClubPrompt() {
  const scheme = useColorScheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <UsersRound size={48} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
      <Text style={[styles.title, { color: semanticColors.labelSecondary[scheme] }]}>
        Rejoins un club pour continuer
      </Text>
      <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
        Ce contenu est propre à chaque club. Rejoins-en un pour voir son activité.
      </Text>
      <Pressable
        onPress={() => router.push("/(tabs)/profile/club-selection")}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.buttonText}>Rejoindre un club</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.accentGreen,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
