import axios from "axios";

// Shared axios instance. Every feature calls the API through this, never with its own axios.
// Responses follow { data, meta? } on success and { error: { code, message, details? } } on failure.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Extracts the API error message so components can show it as-is.
export function getErrorMessage(error) {
  return error?.response?.data?.error?.message ?? error?.message ?? "Something went wrong";
}
