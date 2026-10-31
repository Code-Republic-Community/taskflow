import { useQuery } from "@tanstack/react-query";
import { api, getErrorMessage, type ApiResponse } from "./api/client";
import { useUnauthorizedRedirect } from "./features/auth/useUnauthorizedRedirect";

interface Health {
  status: "ok";
  db: "connected" | "disconnected";
}

async function fetchHealth(): Promise<Health> {
  const res = await api.get<ApiResponse<Health>>("/health");
  return res.data.data;
}

function ApiStatus() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: false,
  });

  if (isPending) return <p>Checking API…</p>;
  if (isError) return <p role="alert">API unreachable: {getErrorMessage(error)}</p>;
  return (
    <p>
      API: {data.status} · database: {data.db}
    </p>
  );
}

export default function App() {
  useUnauthorizedRedirect();
  return (
    <main>
      <h1>TaskFlow</h1>
      <ApiStatus />
    </main>
  );
}
