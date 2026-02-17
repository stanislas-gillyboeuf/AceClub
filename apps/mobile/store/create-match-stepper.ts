import { create } from "zustand";

interface CreateMatchStepperState {
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const useCreateMatchStepperStore = create<CreateMatchStepperState>(
  (set, get) => ({
    currentStep: 0,
    totalSteps: 4,
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
    reset: () => set({ currentStep: 0 }),
  })
);
