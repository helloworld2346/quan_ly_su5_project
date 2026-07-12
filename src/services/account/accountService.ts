import api from "../api";
import type {
  AccountResponse,
  AccountListResponse,
  UpdateAccountRequest,
  UpdateChucNangRequest,
} from "../../types/account";  

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

  getAllAccounts: async (): Promise<AccountListResponse> => {
    const response = await api.get<AccountListResponse>("/account/getAll");
    return response.data;
  },

  updateAccount: async (
    id: string,
    data: UpdateAccountRequest,
  ): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(`/account/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/account/${id}`);
  },

  resetPassword: async (id: string, matKhauMoi: string): Promise<void> => {
    await api.put(`/account/${id}/reset-password`, { matKhauMoi });
  },

  lockAccount: async (id: string): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(`/account/${id}/lock`);
    return response.data;
  },

  unlockAccount: async (id: string): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(`/account/${id}/unlock`);
    return response.data;
  },

  updateChucNang: async (
    id: string,
    data: UpdateChucNangRequest,
  ): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(
      `/account/${id}/chucnang`,
      data,
    );
    return response.data;
  },
};