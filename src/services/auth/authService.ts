import api from "../api";
import type { LoginRequest, LoginResponse } from "../../types/auth";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  logout: async (token: string): Promise<void> => {
    await api.post("/auth/logout", { token });
  },
};