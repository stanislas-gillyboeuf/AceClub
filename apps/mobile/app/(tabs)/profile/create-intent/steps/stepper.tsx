import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";
import { useCreateIntentStepperStore } from "@/store/create-intent-stepper";
import { StepProgress } from "./step-progress";
import Step1 from "./step-1";
import Step2 from "./step-2";
import Step3 from "./step-3";
import StepTeammates from "./step-teammates";
import Step4 from "./step-4";

const STEPS_TENNIS = [Step1, Step2, Step3, Step4] as const;
const STEPS_PADEL = [Step1, Step2, Step3, StepTeammates, Step4] as const;

export function getIntentSteps(isPadel: boolean) {
  return isPadel ? STEPS_PADEL : STEPS_TENNIS;
}

export default function Stepper({ isPadel }: { isPadel: boolean }) {
  const currentStep = useCreateIntentStepperStore((s) => s.currentStep);
  const totalSteps = useCreateIntentStepperStore((s) => s.totalSteps);
  const steps = getIntentSteps(isPadel);
  const StepComponent = steps[currentStep];

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
