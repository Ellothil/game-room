import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  username: string;
  id: string;
  displayName?: string;
  profilePicture?: string;
  profileCompleted?: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token: string, user: User) => {
        set({ isAuthenticated: true, token, user });
      },
      logout: () => {
        set({ isAuthenticated: false, token: null, user: null });
      },
      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: "game-room-auth",
    }
  )
);
