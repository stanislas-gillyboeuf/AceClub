import { View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateMatchStepperStore } from "@/store/create-match-stepper";
import { colors, semanticColors } from "@/constants/theme";

export function StepProgress() {
  const scheme = useColorScheme();
  const currentStep = useCreateMatchStepperStore((s) => s.currentStep);
  const totalSteps = useCreateMatchStepperStore((s) => s.totalSteps);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.capsule,
            {
              backgroundColor:
                i <= currentStep
                  ? colors.accentGreen
                  : semanticColors.borderColor[scheme],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  capsule: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
