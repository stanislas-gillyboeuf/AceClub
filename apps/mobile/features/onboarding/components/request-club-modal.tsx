import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, radii } from "@/constants/theme";
import { X, CheckCircle2 } from "lucide-react-native";
import { useRequestClub } from "@/hooks/use-organization";
import Button from "@/components/ui/button";

interface RequestClubModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RequestClubModal({ visible, onClose }: RequestClubModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const requestClub = useRequestClub();

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim()) return;
    try {
      await requestClub.mutateAsync({ name: name.trim(), city: city.trim() });
      setSubmitted(true);
    } catch {
      // ignore - error shown via mutation state
    }
  };

  const handleClose = () => {
    setName("");
    setCity("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {submitted ? "Demande envoyee !" : "Proposer un club"}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={colors.gray500} />
            </Pressable>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <CheckCircle2 size={56} color={colors.accentGreen} />
              <Text style={styles.successText}>
                Ta demande a bien ete envoyee. Nous te tiendrons informe !
              </Text>
              <Button
                label="Fermer"
                onPress={handleClose}
                style={{ marginTop: 8 }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Ton club n'est pas dans la liste ? Propose-le et nous
                l'ajouterons rapidement.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Nom du club</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Tennis Club de Paris"
                  placeholderTextColor={colors.gray400}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Ville</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ex: Paris"
                  placeholderTextColor={colors.gray400}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              {requestClub.error && (
                <Text style={styles.errorText}>
                  Une erreur est survenue. Reessaie.
                </Text>
              )}

              <Button
                label="Envoyer"
                onPress={handleSubmit}
                disabled={!name.trim() || !city.trim()}
                loading={requestClub.isPending}
                style={{ marginTop: 4 }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray500,
    marginBottom: 20,
    lineHeight: 21,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.gray50,
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    marginBottom: 12,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 16,
  },
  successText: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: "center",
    lineHeight: 22,
  },
});
