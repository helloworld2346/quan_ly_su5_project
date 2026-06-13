import api from "../api";
import type { AccountResponse } from "../../types/account";

export interface CreateAccountRequest {
  tenTaiKhoan: string;
  tenDangNhap: string;
  matkhau: string;
  donVi: string;
  vaiTro: string;
}

export const accountService = {
  getAccount: async (): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>("/account");
    return response.data;
  },

  createAccount: async (
    data: CreateAccountRequest,
  ): Promise<AccountResponse> => {
    const response = await api.post<AccountResponse>("/account", data);
    return response.data;
  },
};
