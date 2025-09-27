import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  username: string;
  id: string;
};

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
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
    }),
    {
      name: "game-room-auth",
    }
  )
);
