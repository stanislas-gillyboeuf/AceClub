import { useEffect, useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import Animated, { FadeIn, withTiming, withDelay } from "react-native-reanimated";

interface NameStepProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export function NameStep({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: NameStepProps) {
  const firstNameRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => firstNameRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          Comment t'appelles-tu ?
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          C'est le prénom que verront tes partenaires de jeu.
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
        <TextInput
          ref={firstNameRef}
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="Prénom"
          placeholderTextColor={colors.gray400}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
        <TextInput
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Nom (optionnel)"
          placeholderTextColor={colors.gray400}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />
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
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray500,
    lineHeight: 22,
  },
  inputs: {
    gap: 10,
    marginHorizontal: 20,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.black,
    borderRadius: 12,
    backgroundColor: "rgba(120, 120, 128, 0.08)",
  },
});
