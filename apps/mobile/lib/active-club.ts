import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

/**
 * The player's currently selected club, persisted across launches. Every
 * player-facing request (feed, discover, matches, leaderboard) is scoped to
 * this club server-side — see `hooks/use-active-club.ts` for how it's kept
 * in sync with the server's active organization and how query caches are
 * cleared when it changes.
 */

const secureStorage = {
  getItem: async (name: string) => (await SecureStore.getItemAsync(name)) ?? null,
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

interface ActiveClubState {
  activeClubId: string | null;
  hasHydrated: boolean;
  setActiveClubId: (id: string | null) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useActiveClubStore = create<ActiveClubState>()(
  persist(
    (set) => ({
      activeClubId: null,
      hasHydrated: false,
      setActiveClubId: (id) => set({ activeClubId: id }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "active-club-id",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ activeClubId: state.activeClubId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
