import { useAuth } from "../features/auth/useAuth";

// Temporary until TF-14 adds the real projects page and protected routes.
export function ProjectsPlaceholder() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <p>Loading…</p>;

  return (
    <main>
      <h1>Projects</h1>
      <p>Signed in as {user?.name}</p>
      <button onClick={logout} type="button">
        Logout
      </button>
    </main>
  );
}
