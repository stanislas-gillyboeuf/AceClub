import { create } from "zustand";
import type { MatchIntentType } from "@/types/match-intent";
import type { UserSearchItem } from "@/types/user";
import type { Sport } from "@/types/common";

interface CreateIntentFormData {
  sport: Sport;
  intentType: MatchIntentType;
  date: Date;
  time: Date;
  isFlexibleDate: boolean;
  duration: number | null;
  description: string;
  teammates: (UserSearchItem | null)[];
}

interface CreateIntentFormState extends CreateIntentFormData {
  setSport: (sport: Sport) => void;
  setIntentType: (type: MatchIntentType) => void;
  setDate: (date: Date) => void;
  setTime: (time: Date) => void;
  setIsFlexibleDate: (isFlexibleDate: boolean) => void;
  setDuration: (duration: number | null) => void;
  setDescription: (description: string) => void;
  setTeammate: (slotIndex: number, user: UserSearchItem | null) => void;
  reset: () => void;
}

function defaultTime(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

const defaultState = (): CreateIntentFormData => ({
  sport: "tennis",
  intentType: "match",
  date: new Date(),
  time: defaultTime(),
  isFlexibleDate: false,
  duration: null,
  description: "",
  teammates: [null, null, null],
});

export const useCreateIntentFormStore = create<CreateIntentFormState>((set) => ({
  ...defaultState(),

  setSport: (sport) => set({ sport }),
  setIntentType: (intentType) => set({ intentType }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setIsFlexibleDate: (isFlexibleDate) => set({ isFlexibleDate }),
  setDuration: (duration) => set({ duration }),
  setDescription: (description) => set({ description }),
  setTeammate: (slotIndex, user) =>
    set((state) => {
      const teammates = [...state.teammates];
      teammates[slotIndex] = user;
      return { teammates };
    }),
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
