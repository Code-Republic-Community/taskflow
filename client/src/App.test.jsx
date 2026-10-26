import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import App from "./App";
import { api } from "./api/client";

describe("App", () => {
  it("renders the TaskFlow title", async () => {
    vi.spyOn(api, "get").mockResolvedValue({ data: { data: { status: "ok", db: "connected" } } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "TaskFlow" })).toBeInTheDocument();
    expect(await screen.findByText(/database: connected/)).toBeInTheDocument();
  });
});
