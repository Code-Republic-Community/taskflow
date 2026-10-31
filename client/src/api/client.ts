import axios from "axios";

// Shared axios instance. Every feature calls the API through this, never with its own axios.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Response shapes of the API (see CLAUDE.md).
export interface ApiResponse<T> {
  data: T;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type FieldErrors = Record<string, string>;

const TOKEN_KEY = "taskflow.token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// Extracts the API error message so components can show it as-is.
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";

    this.status = status;
    this.code = code;
    this.details = details;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const body = error.response?.data?.error;
      if (error.response && body) {
        if (error.response.status === 401 && error.config?.headers?.Authorization) {
          clearToken();
          onUnauthorized?.();
        }
        return Promise.reject(
          new ApiError(body.message, error.response.status, body.code, body.details),
        );
      }
      if (!error.response) {
        return Promise.reject(
          new ApiError("Cannot reach the server. Check your connection.", 0, "NETWORK_ERROR"),
        );
      }
    }
    return Promise.reject(error);
  },
);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};

  const result: FieldErrors = {};
  for (const item of error.details) {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof item.field === "string" &&
      typeof item.message === "string"
    ) {
      result[item.field] = item.message;
    }
  }
  return result;
}
