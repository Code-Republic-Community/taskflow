import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { fetchMe, login as loginRequest, register as registerRequest } from "./api";
import { useAuthStore } from "./authStore";
import type { LoginInput, RegisterInput } from "../../types/authTypes";

export const ME_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    enabled: Boolean(token),
    retry: false,
  });

  async function login(input: LoginInput) {
    const result = await loginRequest(input);
    setSession(result.token);
    queryClient.setQueryData(ME_QUERY_KEY, result.user);
  }

  async function register(input: RegisterInput) {
    const result = await registerRequest(input);
    setSession(result.token);
    queryClient.setQueryData(ME_QUERY_KEY, result.user);
  }

  function logout() {
    clearSession();
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
    navigate("/login");
  }

  return {
    user: token ? (meQuery.data ?? null) : null,
    isLoading: Boolean(token) && meQuery.isPending,
    login,
    register,
    logout,
  };
}
