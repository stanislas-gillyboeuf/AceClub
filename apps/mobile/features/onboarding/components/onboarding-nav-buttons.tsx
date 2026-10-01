import { View, Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { onboardingColors } from "../theme";

interface OnboardingNavButtonsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  label: string;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingNavButtons({
  canGoBack,
  canGoNext,
  label,
  isSubmitting,
  onBack,
  onNext,
}: OnboardingNavButtonsProps) {
  const disabled = !canGoNext || isSubmitting;

  return (
    <View style={styles.container}>
      {canGoBack ? (
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
          <ChevronLeft size={22} color={onboardingColors.fg} strokeWidth={2.5} />
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <Pressable
        onPress={onNext}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          disabled && styles.buttonDisabled,
          pressed && !disabled && styles.buttonPressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={onboardingColors.accentForeground} />
        ) : (
          <Text style={styles.buttonLabel}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 44,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: onboardingColors.accent,
  },
  buttonDisabled: {
    opacity: 0.4,
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
