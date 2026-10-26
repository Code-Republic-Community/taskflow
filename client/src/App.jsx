import { useQuery } from "@tanstack/react-query";
import { api, getErrorMessage } from "./api/client";

async function fetchHealth() {
  const res = await api.get("/health");
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
  return (
    <main>
      <h1>TaskFlow</h1>
      <ApiStatus />
    </main>
  );
}
