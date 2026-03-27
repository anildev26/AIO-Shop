import { create } from "zustand";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AuthState {
  user: UserProfile | null;
  isLoaded: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  isLoading: true,

  setUser: (user) => set({ user, isLoaded: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  clear: () => set({ user: null, isLoaded: true, isLoading: false }),
}));
