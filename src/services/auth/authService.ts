import api from "../api";
import type { LoginRequest, LoginResponse } from "../../types/auth";

const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === "true";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        code: 200,
        message: "Login successful",
        Result: {
          authenticated: true,
          token: "mock-token-" + Date.now(),
        },
      };
    }
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  logout: async (token: string): Promise<void> => {
    if (!MOCK_MODE) {
      await api.post("/auth/logout", { token });
    }
  },
};
