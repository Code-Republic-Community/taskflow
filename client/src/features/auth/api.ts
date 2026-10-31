import { api, type ApiResponse } from "../../api/client";
import type { AuthResult, LoginInput, RegisterInput, User } from "../../types/authTypes";

export const login = async (data: LoginInput): Promise<AuthResult> => {
  const response = await api.post<ApiResponse<AuthResult>>("/auth/login", data);
  return response.data.data;
};

export const register = async (data: RegisterInput): Promise<AuthResult> => {
  const response = await api.post<ApiResponse<AuthResult>>("/auth/register", data);
  return response.data.data;
};

export const fetchMe = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
};
