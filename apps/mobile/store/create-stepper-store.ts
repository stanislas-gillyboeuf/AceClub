import { create, type StoreApi, type UseBoundStore } from "zustand";

export interface StepperState {
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export interface CreateStepperStoreOptions {
  totalSteps: number;
  initialStep?: number;
}

export function createStepperStore(
  options: CreateStepperStoreOptions
): UseBoundStore<StoreApi<StepperState>> {
  const initialStep = options.initialStep ?? 0;

  return create<StepperState>((set, get) => ({
    currentStep: initialStep,
    totalSteps: options.totalSteps,
    next: () => {
      const { currentStep, totalSteps } = get();
      if (currentStep < totalSteps - 1) {
        set({ currentStep: currentStep + 1 });
      }
    },
    prev: () => {
      const { currentStep } = get();
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1 });
      }
    },
    goTo: (step) => set({ currentStep: step }),
    reset: () => set({ currentStep: initialStep }),
  }));
}
