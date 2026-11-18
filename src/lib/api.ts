import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "./authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000, // uploads can be slow
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let sessionToastShown = false;

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      (res as any).message = body.message;
      res.data = body.data;
    }
    return res;
  },
  (err: AxiosError<any>) => {
    // Expired / invalid session → sign out once, with a clear message
    if (err.response?.status === 401 && useAuthStore.getState().token && !err.config?.url?.includes("/auth/login")) {
      useAuthStore.getState().logout();
      if (!sessionToastShown) {
        sessionToastShown = true;
        toast.error(err.response.data?.message || "Your session has expired. Please sign in again.");
        setTimeout(() => (sessionToastShown = false), 3000);
      }
    }
    return Promise.reject(err);
  }
);

export const msg = (res: unknown, fallback: string) => ((res as any)?.message as string) || fallback;

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as AxiosError<any>;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === "ECONNABORTED") return "The request timed out. Check your connection and try again.";
  if (e?.isAxiosError && !e.response) return "Can't reach the server. Check your internet connection.";
  return fallback;
}

export function fieldErrors(err: unknown): Record<string, string> {
  const list: { field: string; message: string }[] = (err as AxiosError<any>)?.response?.data?.errors || [];
  return Object.fromEntries(list.map((f) => [f.field, f.message]));
}

export const notifyError = (err: unknown, fallback?: string) => toast.error(errorMessage(err, fallback));
