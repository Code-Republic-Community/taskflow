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

// Extracts the API error message so components can show it as-is.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
