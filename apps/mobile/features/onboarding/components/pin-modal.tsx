import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, radii } from "@/constants/theme";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const PIN_LENGTH = 4;

interface PinModalProps {
  visible: boolean;
  clubName: string;
  isVerifying: boolean;
  error: string | null;
  onVerify: (pin: string) => void;
  onClose: () => void;
}

export function PinModal({
  visible,
  clubName,
  isVerifying,
  error,
  onVerify,
  onClose,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPin("");
    }
  }, [error]);

  const handlePinChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(filtered);
  };

  const handleVerify = () => {
    if (pin.length === PIN_LENGTH) {
      onVerify(pin);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Code PIN requis</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.gray500} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Entre le code PIN du club {clubName} pour le rejoindre.
          </Text>

          <View style={styles.pinRow}>
            {Array.from({ length: PIN_LENGTH }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.pinCell,
                  pin.length > i && styles.pinCellFilled,
                  error && styles.pinCellError,
                ]}
              >
                <Text style={[styles.pinDigit, error && styles.pinDigitError]}>
                  {pin[i] ?? ""}
                </Text>
              </View>
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            style={styles.hiddenInput}
            autoFocus
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={handleVerify}
              disabled={pin.length < PIN_LENGTH || isVerifying}
              style={[
                styles.verifyButton,
                (pin.length < PIN_LENGTH || isVerifying) &&
                  styles.verifyButtonDisabled,
              ]}
            >
              {isVerifying ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.verifyText}>Valider</Text>
              )}
            </Pressable>
          </View>
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
    marginBottom: 24,
    lineHeight: 21,
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  pinCell: {
    width: 56,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.gray200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray50,
  },
  pinCellFilled: {
    borderColor: colors.accentGreen,
    backgroundColor: `${colors.accentGreen}10`,
  },
  pinCellError: {
    borderColor: colors.red500,
    backgroundColor: colors.red50,
  },
  pinDigit: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.black,
  },
  pinDigitError: {
    color: colors.red500,
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    textAlign: "center",
    marginBottom: 16,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray500,
  },
  verifyButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.4,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
