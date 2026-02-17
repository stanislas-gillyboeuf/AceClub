import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";

interface StepperNavProps {
  canGoPrev: boolean;
  canProceed: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  lastStepLabel?: string;
  nextLabel?: string;
}

export function StepperNav({
  canGoPrev,
  canProceed,
  isLastStep,
  isFirstStep,
  isLoading = false,
  onBack,
  onNext,
  onCancel,
  lastStepLabel = "Créer",
  nextLabel = "Continuer",
}: StepperNavProps) {
  const scheme = useColorScheme();

  const buttonLabel = isLastStep ? lastStepLabel : nextLabel;
  const disabled = !canProceed || isLoading;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.primaryBackground[scheme] },
      ]}
    >
      <Pressable
        onPress={onNext}
        disabled={disabled}
        style={({ pressed }) => [
          styles.primaryButton,
          { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
        )}
      </Pressable>

      {isFirstStep ? (
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text
            style={[
              styles.secondaryButtonText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            Annuler
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onBack}
          disabled={!canGoPrev}
          style={styles.secondaryButton}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            Retour
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: colors.accentGreen,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
  },
});
