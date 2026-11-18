import { create } from "zustand";
const read = () => {
    try {
        return JSON.parse(localStorage.getItem("tlb_admin_user") || "null");
    }
    catch {
        return null;
    }
};
export const useAuthStore = create((set) => ({
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
