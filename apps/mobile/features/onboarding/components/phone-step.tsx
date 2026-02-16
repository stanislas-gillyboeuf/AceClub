import { useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radii } from "@/constants/theme";
import { Phone } from "lucide-react-native";
import { StepHeader } from "./step-header";

interface PhoneStepProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
}

export function PhoneStep({ phoneNumber, onPhoneChange }: PhoneStepProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string) => {
    const filtered = text.replace(/[^0-9\s\-.()]/g, "");
    onPhoneChange(filtered);
  };

  return (
    <View style={styles.container}>
      <StepHeader
        icon={Phone}
        title="Ton numero"
        subtitle="Pour que les autres joueurs puissent te contacter"
      />

      <View style={styles.inputContainer}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+33</Text>
        </View>
        <TextInput
          ref={inputRef}
          value={phoneNumber}
          onChangeText={handleChange}
          placeholder="6 12 34 56 78"
          placeholderTextColor={colors.gray400}
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={14}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    overflow: "hidden",
  },
  prefix: {
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: colors.gray100,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
  },
  prefixText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.gray600,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 14,
    fontSize: 17,
    color: colors.black,
    letterSpacing: 0.5,
  },
});
