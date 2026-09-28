import { useState } from "react";
import { View, Text, TextInput, Modal, StyleSheet, Alert } from "react-native";
import Button from "@/components/ui/button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii } from "@/constants/theme";
import { useReportUser } from "@/hooks/use-block";

interface ReportUserSheetProps {
  visible: boolean;
  userId: string | null;
  context?: string;
  onClose: () => void;
}

/** Cross-platform replacement for Alert.prompt (iOS-only): a small modal collecting a free-text
 * reason, used to report a player from their profile or from a conversation. */
export function ReportUserSheet({ visible, userId, context, onClose }: ReportUserSheetProps) {
  const scheme = useColorScheme();
  const [reason, setReason] = useState("");
  const reportUser = useReportUser();

  const handleSubmit = () => {
    if (!userId || reason.trim().length === 0) return;
    reportUser.mutate(
      { userId, reason: reason.trim(), context },
      {
        onSuccess: () => {
          setReason("");
          onClose();
          Alert.alert("Signalement envoyé", "Merci, notre équipe va l'examiner.");
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible d'envoyer le signalement pour le moment.");
        },
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            Signaler ce joueur
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: semanticColors.labelPrimary[scheme],
                borderColor: semanticColors.borderColor[scheme],
              },
            ]}
            placeholder="Décrivez le problème..."
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
          <View style={styles.actions}>
            <Button
              label="Annuler"
              variant="secondary"
              style={styles.actionButton}
              onPress={() => {
                setReason("");
                onClose();
              }}
            />
            <Button
              label="Envoyer"
              variant="destructive"
              style={styles.actionButton}
              disabled={reason.trim().length === 0}
              loading={reportUser.isPending}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: radii.lg,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
