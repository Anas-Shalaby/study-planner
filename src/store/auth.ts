import { create } from "zustand";
import { auth } from "../lib/api";
import type { User } from "../lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    college: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const { data } = await auth.login(email, password);
    localStorage.setItem("token", data.token);
    set({ user: data.user });
  },
  register: async (userData) => {
    const { data } = await auth.register(userData);
    console.log(data);
    localStorage.setItem("token", data.token);
    set({ user: data.user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const { data } = await auth.me();
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
