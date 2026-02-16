import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { X, KeyRound } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EERecovery } from "@/hooks/use-e2ee";
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

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <KeyRound size={24} color={colors.accentGreen} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
              Entrez la phrase de passe que vous avez utilisee lors de la sauvegarde de votre cle
              pour la restaurer sur cet appareil.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: semanticColors.labelSecondary[scheme] }]}>
              Phrase de passe
            </Text>
            <TextInput
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry
              placeholder="Votre phrase de passe"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              style={[
                styles.input,
                {
                  color: semanticColors.labelPrimary[scheme],
                  backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F2F2F7",
                },
              ]}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

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
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
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
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 16,
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
