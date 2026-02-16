import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { colors, radii, sizes } from "@/constants/theme";
import { ChevronLeft } from "lucide-react-native";

interface NavButtonsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function NavButtons({
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
}: NavButtonsProps) {
  return (
    <View style={styles.container}>
      {canGoBack ? (
        <Pressable onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={20} color={colors.gray500} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <Pressable
        onPress={onNext}
        disabled={!canGoNext || isSubmitting}
        style={[
          styles.nextButton,
          (!canGoNext || isSubmitting) && styles.nextButtonDisabled,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.nextText}>
            {isLastStep ? "Terminer" : "Continuer"}
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 12,
  },
  backText: {
    fontSize: 16,
    color: colors.gray500,
    fontWeight: "500",
  },
  backPlaceholder: {
    width: 80,
  },
  nextButton: {
    flex: 1,
    height: sizes.buttonHeight,
    borderRadius: radii.md,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
  },
});
