import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { Search, Check, Lock } from "lucide-react-native";
import { useVerifyPin } from "@/hooks/use-organization";
import Animated, {
  FadeIn,
  FadeOut,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { Organization } from "@/types/organization";

const PIN_LENGTH = 4;

interface ClubStepProps {
  firstName: string;
  selectedOrganization: Organization | null;
  isPinVerified: boolean;
  onPinVerified: (pin: string) => void;
}

export function ClubStep({
  firstName,
  selectedOrganization,
  isPinVerified,
  onPinVerified,
}: ClubStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const hiddenInputRef = useRef<TextInput>(null);
  const verifyPin = useVerifyPin();

  const needsPin = !!selectedOrganization?.pinEnabled && !isPinVerified;

  // Reset digits when org changes
  useEffect(() => {
    setDigits(Array(PIN_LENGTH).fill(""));
  }, [selectedOrganization?.id]);

  // Auto-focus PIN input when a PIN club is selected
  useEffect(() => {
    if (needsPin) {
      const timer = setTimeout(() => hiddenInputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [needsPin]);

  const pin = digits.join("");

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
    const next = Array(PIN_LENGTH).fill("");
    for (let i = 0; i < cleaned.length; i++) {
      next[i] = cleaned[i];
    }
    setDigits(next);
  };

  const handlePinSubmit = () => {
    if (!selectedOrganization || pin.length < PIN_LENGTH) return;
    verifyPin.mutate(
      { organizationId: selectedOrganization.id, pin },
      {
        onSuccess: (result) => {
          if (result.valid) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onPinVerified(pin);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setDigits(Array(PIN_LENGTH).fill(""));
            hiddenInputRef.current?.focus();
            Alert.alert("PIN incorrect", "Le code PIN est invalide.");
          }
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible de verifier le PIN.");
        },
      }
    );
  };

  // Auto-submit when all digits filled
  useEffect(() => {
    if (pin.length === PIN_LENGTH && needsPin) {
      handlePinSubmit();
    }
  }, [pin]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          {firstName ? `Super, ${firstName}. Quel est ton club ?` : "Quel est ton club ?"}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          Rejoins ton club et retrouve tes partenaires de jeu.
        </Animated.Text>
      </View>

      <Animated.View
        entering={() => {
          'worklet';
          return {
            initialValues: { opacity: 0, transform: [{ scale: 0.98 }] },
            animations: {
              opacity: withDelay(300, withTiming(1, { duration: 350 })),
              transform: [{ scale: withDelay(300, withTiming(1, { duration: 400 })) }],
            },
          };
        }}
        style={styles.inputs}
      >
        <Pressable
          onPress={() => router.push("/(onboarding)/club-selection" as any)}
          style={({ pressed }) => pressed && styles.cardPressed}
        >
          <Animated.View
            style={[
              styles.card,
              selectedOrganization ? styles.cardSelected : styles.cardDefault,
            ]}
          >
            {selectedOrganization ? (
              <>
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarText}>
                    {selectedOrganization.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.selectedText} numberOfLines={1}>
                    {selectedOrganization.name}
                  </Text>
                  <Text style={styles.cardSubtitle}>Club</Text>
                </View>
                {isPinVerified || !selectedOrganization.pinEnabled ? (
                  <View style={styles.checkCircle}>
                    <Check size={14} color={colors.white} />
                  </View>
                ) : (
                  <Lock size={14} color={colors.gray400} />
                )}
              </>
            ) : (
              <>
                <Search size={18} color={colors.gray400} />
                <Text style={styles.placeholder}>Rechercher un club...</Text>
              </>
            )}
          </Animated.View>
        </Pressable>

        {needsPin && (
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(250)} style={styles.pinSection}>
            <View style={styles.pinLabelRow}>
              <Lock size={14} color={colors.gray500} />
              <Text style={styles.pinLabel}>
                Ce club nécessite un code PIN
              </Text>
            </View>

            <Pressable
              style={styles.otpRow}
              onPress={() => hiddenInputRef.current?.focus()}
            >
              {digits.map((digit, i) => (
                <View
                  key={i}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                >
                  <Text style={[styles.otpDigit, digit ? styles.otpDigitFilled : null]}>
                    {digit}
                  </Text>
                </View>
              ))}
            </Pressable>

            <TextInput
              ref={hiddenInputRef}
              value={pin}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              style={styles.hiddenInput}
              autoComplete="one-time-code"
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.37,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray500,
    lineHeight: 22,
  },
  inputs: {
    marginHorizontal: 20,
    gap: 24,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDefault: {
    backgroundColor: "rgba(120, 120, 128, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(120, 120, 128, 0.16)",
  },
  cardSelected: {
    backgroundColor: `${colors.accentGreen}08`,
    borderWidth: 1.5,
    borderColor: colors.accentGreen,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAvatarText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  cardInfo: {
    flex: 1,
    gap: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.gray400,
  },
  placeholder: {
    fontSize: 17,
    color: colors.gray400,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSection: {
    gap: 14,
  },
  pinLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pinLabel: {
    fontSize: 15,
    color: colors.gray500,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
  },
  otpBox: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: "rgba(120, 120, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    backgroundColor: `${colors.accentGreen}12`,
    borderWidth: 1.5,
    borderColor: colors.accentGreen,
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.black,
  },
  otpDigitFilled: {
    color: colors.accentGreen,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
