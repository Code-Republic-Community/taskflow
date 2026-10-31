import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { setUnauthorizedHandler } from "../../api/client";
import { useAuthStore } from "./authStore";
import { ME_QUERY_KEY } from "./useAuth";

export function useUnauthorizedRedirect() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      navigate("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, queryClient, navigate]);
}
