import { View, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { ChevronLeft } from "lucide-react-native";
import Button from "@/components/ui/button";

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
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <Button
        label={isLastStep ? "Terminer" : "Continuer"}
        onPress={onNext}
        disabled={!canGoNext}
        loading={isSubmitting}
        style={{ flex: 1 }}
      />
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
  backPlaceholder: {
    width: 80,
  },
});
