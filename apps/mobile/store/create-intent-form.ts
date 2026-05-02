import { create } from "zustand";
import type { MatchIntentType } from "@/types/match-intent";

interface CreateIntentFormData {
  intentType: MatchIntentType;
  date: Date;
  time: Date;
  duration: number | null;
  description: string;
}

interface CreateIntentFormState extends CreateIntentFormData {
  setIntentType: (type: MatchIntentType) => void;
  setDate: (date: Date) => void;
  setTime: (time: Date) => void;
  setDuration: (duration: number | null) => void;
  setDescription: (description: string) => void;
  reset: () => void;
}

function defaultTime(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

const defaultState = (): CreateIntentFormData => ({
  intentType: "match",
  date: new Date(),
  time: defaultTime(),
  duration: null,
  description: "",
});

export const useCreateIntentFormStore = create<CreateIntentFormState>((set) => ({
  ...defaultState(),

  setIntentType: (intentType) => set({ intentType }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setDuration: (duration) => set({ duration }),
  setDescription: (description) => set({ description }),
  reset: () => set(defaultState()),
}));

// --- Utilities ---

export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

export function isTimeValid(date: Date, time: Date): boolean {
  const combined = combineDateAndTime(date, time);
  const minimum = new Date(Date.now() + 60 * 60 * 1000);
  return combined >= minimum;
}

export function formatDurationLabel(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  }
  return `${minutes} min`;
}
