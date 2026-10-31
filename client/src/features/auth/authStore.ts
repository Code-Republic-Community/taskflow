import { create } from "zustand";
import { clearToken, getToken, setToken } from "../../api/client";

type AuthState = {
  token: string | null;
  setSession: (token: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  token: getToken(),
  setSession: (token) => {
    setToken(token);
    set({ token });
  },
  clearSession: () => {
    clearToken();
    set({ token: null });
  },
}));
