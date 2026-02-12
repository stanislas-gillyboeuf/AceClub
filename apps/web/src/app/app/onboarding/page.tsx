"use client";

import { OnboardingStepper } from "@/components/custom/onboarding/onboarding-stepper";

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <OnboardingStepper />
      </div>
    </div>
  );
}
