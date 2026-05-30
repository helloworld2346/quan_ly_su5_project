export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    authenticated: boolean;
    token: string;
  };
}
