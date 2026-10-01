import { useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { onboardingColors } from "@/features/onboarding/theme";

interface OtpCodeInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

/** Digit-box code input — pattern lifted from the club PIN entry in
 * apps/mobile/features/onboarding/components/club-step.tsx (otpRow/otpBox/otpDigit), generalized
 * for any length and restyled for the dark onboarding/auth theme. */
export function OtpCodeInput({ length, value, onChange, autoFocus }: OtpCodeInputProps) {
  const hiddenInputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, "").slice(0, length));
  };

  return (
    <Pressable style={styles.row} onPress={() => hiddenInputRef.current?.focus()}>
      {digits.map((digit, i) => (
        <View key={i} style={[styles.box, digit ? styles.boxFilled : null]}>
          <Text style={[styles.digit, digit ? styles.digitFilled : null]}>{digit}</Text>
        </View>
      ))}
      <TextInput
        ref={hiddenInputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFilled: {
    backgroundColor: onboardingColors.cardBgSelected,
    borderColor: onboardingColors.cardBorderSelected,
  },
  digit: {
    fontSize: 24,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  digitFilled: {
    color: onboardingColors.accent,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
