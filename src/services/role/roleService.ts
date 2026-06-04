import api from "../api";
import type { RoleResponse, Role, RoleByIdResponse } from "../../types/account";

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<RoleResponse>("/vaitro");
    return response.data.Result;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get<RoleByIdResponse>(`/vaitro/${id}`);
    return response.data.Result;
  },
};
