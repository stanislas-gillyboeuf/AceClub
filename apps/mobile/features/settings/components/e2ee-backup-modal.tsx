import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Shield } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EEBackup } from "@/hooks/use-e2ee";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

interface E2EEBackupModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function E2EEBackupModal({ visible, onDismiss }: E2EEBackupModalProps) {
  const scheme = useColorScheme();
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const { backup, isLoading, error, success, resetSuccess } = useE2EEBackup();

  const canSubmit = passphrase.length >= 6 && passphrase === confirm && !isLoading;

  const handleSubmit = async () => {
    await backup(passphrase);
  };

  if (success) {
    Alert.alert(
      "Sauvegarde réussie",
      "Votre clé de chiffrement a été sauvegardée. Conservez votre phrase de passe en lieu sûr.",
      [
        {
          text: "OK",
          onPress: () => {
            resetSuccess();
            setPassphrase("");
            setConfirm("");
            onDismiss();
          },
        },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onDismiss}>
              <X size={24} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Sauvegarder ma clé
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Info */}
            <View style={styles.infoBox}>
              <Shield size={24} color={colors.accentGreen} strokeWidth={1.5} />
              <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
                Cette phrase de passe protègera votre clé de chiffrement. Vous en aurez besoin pour
                récupérer vos messages chiffrés sur un nouvel appareil.
              </Text>
            </View>

            {/* Passphrase fields */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: semanticColors.labelSecondary[scheme] }]}>
                Phrase de passe (min. 6 caractères)
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

            {/* Validation hints */}
            {passphrase.length > 0 && passphrase.length < 6 && (
              <Text style={styles.hint}>Minimum 6 caractères requis</Text>
            )}
            {confirm.length > 0 && passphrase !== confirm && (
              <Text style={styles.hint}>Les phrases de passe ne correspondent pas</Text>
            )}

            {/* Error */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Submit */}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
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
