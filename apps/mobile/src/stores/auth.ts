import { create } from "zustand";
import { storage } from "@/lib/storage";
import type { User } from "@/types/user";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  user: null,

  setAuth: async (token, user) => {
    await storage.setToken(token);
    set({ isAuthenticated: true, token, user });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    await storage.clear();
    set({ isAuthenticated: false, token: null, user: null });
  },

  initialize: async () => {
    try {
      const token = await storage.getToken();
      set({ isAuthenticated: !!token, token, isLoading: false });
    } catch {
      set({ isAuthenticated: false, token: null, isLoading: false });
    }
  },
}));
