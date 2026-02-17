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
import { X, Shield } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EEBackup } from "@/hooks/use-e2ee";
import { FormField } from "@/components/ui/form-field";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

export default function E2EEBackup() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const { backup, isLoading, error } = useE2EEBackup();

  const canSubmit = passphrase.length >= 6 && passphrase === confirm && !isLoading;

  const handleSubmit = async () => {
    await backup(passphrase);
    Alert.alert(
      "Sauvegarde reussie",
      "Votre cle de chiffrement a ete sauvegardee. Conservez votre phrase de passe en lieu sur.",
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
            <Shield size={24} color={colors.accentGreen} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
              Cette phrase de passe protegera votre cle de chiffrement. Vous en aurez besoin pour
              recuperer vos messages chiffres sur un nouvel appareil.
            </Text>
          </View>

          <FormField
            label="Phrase de passe (min. 6 caractères)"
            value={passphrase}
            onChangeText={setPassphrase}
            secureTextEntry
            placeholder="Votre phrase de passe"
            error={passphrase.length > 0 && passphrase.length < 6 ? "Minimum 6 caractères requis" : null}
          />

          <FormField
            label="Confirmer"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Confirmez la phrase de passe"
            error={confirm.length > 0 && passphrase !== confirm ? "Les phrases de passe ne correspondent pas" : null}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitButton, { opacity: canSubmit ? 1 : 0.5 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Sauvegarder</Text>
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
  errorText: {
    fontSize: 14,
    color: "#ef4444",
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
