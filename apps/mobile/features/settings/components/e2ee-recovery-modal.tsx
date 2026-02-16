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
import { X, KeyRound } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useE2EERecovery } from "@/hooks/use-e2ee";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

interface E2EERecoveryModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function E2EERecoveryModal({ visible, onDismiss }: E2EERecoveryModalProps) {
  const scheme = useColorScheme();
  const [passphrase, setPassphrase] = useState("");
  const { recover, isLoading, error, success, resetSuccess } = useE2EERecovery();

  const canSubmit = passphrase.length > 0 && !isLoading;

  const handleSubmit = async () => {
    await recover(passphrase);
  };

  if (success) {
    Alert.alert(
      "Récupération réussie",
      "Votre clé de chiffrement a été restaurée avec succès.",
      [
        {
          text: "OK",
          onPress: () => {
            resetSuccess();
            setPassphrase("");
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
              Récupérer ma clé
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Info */}
            <View style={styles.infoBox}>
              <KeyRound size={24} color={colors.accentGreen} strokeWidth={1.5} />
              <Text style={[styles.infoText, { color: semanticColors.labelSecondary[scheme] }]}>
                Entrez la phrase de passe que vous avez utilisée lors de la sauvegarde de votre clé
                pour la restaurer sur cet appareil.
              </Text>
            </View>

            {/* Passphrase field */}
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
                <Text style={styles.submitButtonText}>Récupérer</Text>
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
