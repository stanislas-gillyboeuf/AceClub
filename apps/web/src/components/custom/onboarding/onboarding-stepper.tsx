"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { StepWelcome } from "./step-welcome";
import { StepClub } from "./step-club";
import { StepSport } from "./step-sport";
import { StepLevel } from "./step-level";
import { StepPhoto } from "./step-photo";
import { StepPhone } from "./step-phone";
import { useCompleteOnboarding } from "@/hooks/use-user-mutations";
import type { Sport } from "@/types/user";

export interface OnboardingData {
  organizationId: string;
  organizationName: string;
  sport: Sport;
  skillLevel: string;
  imageUrl?: string;
  phoneNumber: string;
  pin?: string;
}

const TOTAL_STEPS = 6;

export function OnboardingStepper() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const completeOnboarding = useCompleteOnboarding();

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async (phoneNumber: string) => {
    const finalData = { ...data, phoneNumber };
    try {
      await completeOnboarding.mutateAsync({
        organizationId: finalData.organizationId!,
        sport: finalData.sport!,
        skillLevel: finalData.skillLevel!,
        phoneNumber: finalData.phoneNumber!,
        imageUrl: finalData.imageUrl,
        pin: finalData.pin,
      });
      router.push("/app");
    } catch {
      // error handled by mutation
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2" />
      <p className="text-center text-xs text-muted-foreground">
        Étape {step} sur {TOTAL_STEPS}
      </p>

      {step === 1 && <StepWelcome onNext={next} />}
      {step === 2 && (
        <StepClub
          onNext={(orgId, orgName, pin) => {
            updateData({ organizationId: orgId, organizationName: orgName, pin });
            next();
          }}
          onBack={prev}
          defaultValue={data.organizationId}
        />
      )}
      {step === 3 && (
        <StepSport
          onNext={(sport) => {
            updateData({ sport });
            next();
          }}
          onBack={prev}
          defaultValue={data.sport}
        />
      )}
      {step === 4 && (
        <StepLevel
          sport={data.sport!}
          onNext={(level) => {
            updateData({ skillLevel: level });
            next();
          }}
          onBack={prev}
          defaultValue={data.skillLevel}
        />
      )}
      {step === 5 && (
        <StepPhoto
          onNext={(imageUrl) => {
            updateData({ imageUrl });
            next();
          }}
          onBack={prev}
        />
      )}
      {step === 6 && (
        <StepPhone
          onComplete={handleComplete}
          onBack={prev}
          isLoading={completeOnboarding.isPending}
          error={completeOnboarding.error?.message}
        />
      )}
    </div>
  );
}
