import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { api, ApiError } from "../../../api/client";
import { useAuthStore } from "../authStore";
import { RegisterForm } from "./RegisterForm";

const user = {
  _id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarColor: "#4f46e5",
  role: "user",
  active: true,
};

function renderRegister() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/projects" element={<h1>Projects</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: user.name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAuthStore.setState({ token: null });
  });

  it("shows validation errors when submitted empty", async () => {
    const post = vi.spyOn(api, "post");
    renderRegister();
    submit();

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("stores the token and goes to /projects after registering", async () => {
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValue({ data: { data: { token: "token-1", user } } });
    renderRegister();
    fillForm();
    submit();

    expect(await screen.findByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/auth/register", {
      name: user.name,
      email: user.email,
      password: "secret123",
    });
    expect(localStorage.getItem("taskflow.token")).toBe("token-1");
    expect(useAuthStore.getState().token).toBe("token-1");
  });

  it("shows server errors under the matching field", async () => {
    vi.spyOn(api, "post").mockRejectedValue(
      new ApiError("A record with this email already exists", 409, "CONFLICT", [
        { field: "email", message: "already exists" },
      ]),
    );
    renderRegister();
    fillForm();
    submit();

    expect(await screen.findByText("already exists")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(localStorage.getItem("taskflow.token")).toBeNull();
  });
});
