import api from "../api";
import type { RoleResponse, Role } from "../../types/account";

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<RoleResponse>("/vaitro");
    return response.data.Result;
  },
};
