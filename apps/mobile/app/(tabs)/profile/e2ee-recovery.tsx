import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { X, KeyRound } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EERecovery } from "@/hooks/use-e2ee";
import { FormField } from "@/components/ui/form-field";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

export default function E2EERecovery() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const { recover, isLoading, error } = useE2EERecovery();

  const canSubmit = passphrase.length > 0 && !isLoading;

  const handleSubmit = async () => {
    await recover(passphrase);
    Alert.alert(
      "Recuperation reussie",
      "Votre cle de chiffrement a ete restauree avec succes.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <KeyRound size={24} color={colors.accentGreen} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
              Entrez la phrase de passe que vous avez utilisee lors de la sauvegarde de votre cle
              pour la restaurer sur cet appareil.
            </Text>
          </View>

          <FormField
            label="Phrase de passe"
            value={passphrase}
            onChangeText={setPassphrase}
            secureTextEntry
            placeholder="Votre phrase de passe"
            error={error}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitButton, { opacity: canSubmit ? 1 : 0.5 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Recuperer</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.horizontal,
    gap: 20,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  submitButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
