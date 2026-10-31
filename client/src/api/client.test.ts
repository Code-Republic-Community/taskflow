import { afterEach, describe, expect, it, vi } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { api, ApiError, getToken, setToken, setUnauthorizedHandler } from "./client";

const originalAdapter = api.defaults.adapter;

// Replaces the network layer so the real interceptors run against a fake response.
function respondWithError(status: number, body: unknown) {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
      status,
      statusText: "",
      headers: {},
      config,
      data: body,
    });
  };
}

const unauthorizedBody = { error: { code: "UNAUTHORIZED", message: "Invalid token" } };

describe("api client", () => {
  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    setUnauthorizedHandler(null);
    localStorage.clear();
  });

  it("sends the stored token as a Bearer header", async () => {
    setToken("token-1");
    let authorization: unknown;
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      authorization = config.headers.Authorization;
      return { status: 200, statusText: "", headers: {}, config, data: { data: null } };
    };

    await api.get("/health");

    expect(authorization).toBe("Bearer token-1");
  });

  it("turns the API error body into an ApiError", async () => {
    respondWithError(400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: [{ field: "email", message: "Invalid email" }],
      },
    });

    const error = await api.post("/auth/register", {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: [{ field: "email", message: "Invalid email" }],
    });
  });

  it("clears the token and calls the handler on 401 with a token", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setToken("expired-token");
    respondWithError(401, unauthorizedBody);

    await expect(api.get("/auth/me")).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(getToken()).toBeNull();
  });

  it("does not log out on 401 without a token (wrong password)", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    respondWithError(401, unauthorizedBody);

    await expect(api.post("/auth/login", {})).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
