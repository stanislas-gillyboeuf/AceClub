import { View, Text, Pressable, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import Animated, { FadeIn, withTiming, withDelay } from "react-native-reanimated";
import { onboardingColors } from "../theme";

interface ReadyStepProps {
  onComplete: () => void;
}

/**
 * Transition screen after sport/level/photo — not the real end of onboarding yet (notifications
 * and location still follow, unchanged). Button says "Continuer", not "Aller à l'app".
 */
export function ReadyStep({ onComplete }: ReadyStepProps) {
  return (
    <View style={styles.container}>
      <Animated.View
        entering={() => {
          "worklet";
          return {
            initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
            animations: {
              opacity: withTiming(1, { duration: 400 }),
              transform: [{ scale: withTiming(1, { duration: 450 }) }],
            },
          };
        }}
        style={styles.iconCircle}
      >
        <CheckCircle2 size={48} color={onboardingColors.accent} strokeWidth={1.75} />
      </Animated.View>

      <Animated.Text entering={FadeIn.delay(150).duration(400)} style={styles.title}>
        C&apos;est prêt.
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(300).duration(400)} style={styles.subtitle}>
        Ton profil est configuré. Encore quelques étapes rapides avant de rejoindre le club.
      </Animated.Text>

      <Animated.View
        entering={() => {
          "worklet";
          return {
            initialValues: { opacity: 0 },
            animations: { opacity: withDelay(400, withTiming(1, { duration: 400 })) },
          };
        }}
        style={styles.buttonWrap}
      >
        <Pressable
          onPress={onComplete}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>Continuer</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,241,105,0.12)",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: onboardingColors.fg,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: onboardingColors.fgDim,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonWrap: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: onboardingColors.accent,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: onboardingColors.accentForeground,
  },
});
