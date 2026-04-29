import { create } from "zustand";
import type { UserSearchItem } from "@/types/user";
import type { Organization } from "@/types/organization";

export type MatchTypeValue = "match" | "training";

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  id: number;
}

interface CreateMatchFormData {
  matchType: MatchTypeValue;
  awayUser: UserSearchItem | null;
  venue: Organization | null;
  scheduledDate: Date;
  selectedSlot: TimeSlot | null;
  isPast: boolean;
}

interface CreateMatchFormState extends CreateMatchFormData {
  setMatchType: (type: MatchTypeValue) => void;
  setAwayUser: (user: UserSearchItem | null) => void;
  setVenue: (venue: Organization | null) => void;
  setScheduledDate: (date: Date) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  setIsPast: (isPast: boolean) => void;
  reset: () => void;
}

const defaultState = (): CreateMatchFormData => ({
  matchType: "match",
  awayUser: null,
  venue: null,
  scheduledDate: new Date(),
  selectedSlot: null,
  isPast: false,
});

export const useCreateMatchFormStore = create<CreateMatchFormState>((set) => ({
  ...defaultState(),

  setMatchType: (matchType) => set({ matchType }),
  setAwayUser: (awayUser) => set({ awayUser }),
  setVenue: (venue) => set({ venue }),
  setScheduledDate: (date) => set({ scheduledDate: date, selectedSlot: null }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setIsPast: (isPast) => set({ isPast, scheduledDate: new Date(), selectedSlot: null }),
  reset: () => set(defaultState()),
}));

// --- Time slot utilities ---

export function generateAllTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 7; h <= 22; h++) {
    slots.push({
      hour: h,
      minute: 0,
      label: `${String(h).padStart(2, "0")}:00`,
      id: h * 60,
    });
    if (h < 22) {
      slots.push({
        hour: h,
        minute: 30,
        label: `${String(h).padStart(2, "0")}:30`,
        id: h * 60 + 30,
      });
    }
  }
  return slots;
}

export function getAvailableSlots(date: Date, isPast = false): TimeSlot[] {
  const all = generateAllTimeSlots();

  // Pour un match passé, tous les créneaux sont disponibles
  if (isPast) return all;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (!isToday) return all;

  const minimumTime = new Date(now.getTime() + 60 * 60 * 1000);

  return all.filter((slot) => {
    const slotDate = new Date(date);
    slotDate.setHours(slot.hour, slot.minute, 0, 0);
    return slotDate >= minimumTime;
  });
}

export function combineDateAndSlot(date: Date, slot: TimeSlot): Date {
  const combined = new Date(date);
  combined.setHours(slot.hour, slot.minute, 0, 0);
  return combined;
}
