import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { X, Shield } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EEBackup } from "@/hooks/use-e2ee";
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

      <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Shield size={24} color={colors.accentGreen} strokeWidth={1.5} />
            <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
              Cette phrase de passe protegera votre cle de chiffrement. Vous en aurez besoin pour
              recuperer vos messages chiffres sur un nouvel appareil.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: semanticColors.labelSecondary[scheme] }]}>
              Phrase de passe (min. 6 caracteres)
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

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: semanticColors.labelSecondary[scheme] }]}>
              Confirmer
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Confirmez la phrase de passe"
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

          {passphrase.length > 0 && passphrase.length < 6 && (
            <Text style={styles.hint}>Minimum 6 caracteres requis</Text>
          )}
          {confirm.length > 0 && passphrase !== confirm && (
            <Text style={styles.hint}>Les phrases de passe ne correspondent pas</Text>
          )}

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
      </View>
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
  hint: {
    fontSize: 13,
    color: colors.accentOrange,
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
