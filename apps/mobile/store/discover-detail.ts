import { create } from "zustand";
import type { MatchIntentWithUser } from "@/types/match-intent";

interface DiscoverDetailState {
  selectedItem: MatchIntentWithUser | null;
  pendingAction: "like" | "pass" | null;

  setSelectedItem: (item: MatchIntentWithUser | null) => void;
  setPendingAction: (action: "like" | "pass" | null) => void;
  consumeAction: () => "like" | "pass" | null;
  reset: () => void;
}

export const useDiscoverDetailStore = create<DiscoverDetailState>((set, get) => ({
  selectedItem: null,
  pendingAction: null,

  setSelectedItem: (item) => set({ selectedItem: item }),
  setPendingAction: (action) => set({ pendingAction: action }),
  consumeAction: () => {
    const action = get().pendingAction;
    set({ pendingAction: null, selectedItem: null });
    return action;
  },
  reset: () => set({ selectedItem: null, pendingAction: null }),
}));
