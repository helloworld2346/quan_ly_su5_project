import api from "../api";
import type { AccountResponse } from "../../types/account";

export const accountService = {
  getAccount: async (): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>("/account");
    return response.data;
  },
};
