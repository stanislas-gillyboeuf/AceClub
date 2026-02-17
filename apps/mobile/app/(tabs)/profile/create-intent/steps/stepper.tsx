import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";
import { useCreateIntentStepperStore } from "@/store/create-intent-stepper";
import { StepProgress } from "./step-progress";
import Step1 from "./step-1";
import Step2 from "./step-2";
import Step3 from "./step-3";
import Step4 from "./step-4";

const STEPS = [Step1, Step2, Step3, Step4] as const;

export default function Stepper() {
  const currentStep = useCreateIntentStepperStore((s) => s.currentStep);
  const totalSteps = useCreateIntentStepperStore((s) => s.totalSteps);
  const StepComponent = STEPS[currentStep];

  if (!StepComponent || currentStep >= totalSteps) return null;

  return (
    <View>
      <StepProgress />
      <Animated.View key={currentStep} entering={FadeIn.duration(200)}>
        <StepComponent />
      </Animated.View>
    </View>
  );
}

export function useIntentStepperActions() {
  return useCreateIntentStepperStore(
    useShallow((s) => ({
      next: s.next,
      prev: s.prev,
      reset: s.reset,
      goTo: s.goTo,
      currentStep: s.currentStep,
      totalSteps: s.totalSteps,
      canGoNext: s.currentStep < s.totalSteps - 1,
      canGoPrev: s.currentStep > 0,
      isFirstStep: s.currentStep === 0,
      isLastStep: s.currentStep === s.totalSteps - 1,
    }))
  );
}
