import { create } from "zustand";

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const read = () => {
  try {
    return JSON.parse(localStorage.getItem("tlb_admin_user") || "null");
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("tlb_admin_token"),
  user: read(),
  setAuth: (token, user) => {
    localStorage.setItem("tlb_admin_token", token);
    localStorage.setItem("tlb_admin_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("tlb_admin_token");
    localStorage.removeItem("tlb_admin_user");
    set({ token: null, user: null });
  },
}));
