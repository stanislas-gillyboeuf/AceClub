import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import Button from "@/components/ui/button";

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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.primaryBackground[scheme] },
      ]}
    >
      <Button
        label={buttonLabel}
        onPress={onNext}
        disabled={!canProceed}
        loading={isLoading}
      />

      {isFirstStep ? (
        <Button label="Annuler" onPress={onCancel} variant="secondary" />
      ) : (
        <Button
          label="Retour"
          onPress={onBack}
          variant="secondary"
          disabled={!canGoPrev}
        />
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
});
