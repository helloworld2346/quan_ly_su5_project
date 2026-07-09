import api from "../api";
import type {
  RoleResponse,
  Role,
  RoleByIdResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  DeleteRoleResponse,
} from "../../types/account";

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<RoleResponse>("/vaitro");
    return response.data.Result;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get<RoleByIdResponse>(`/vaitro/${id}`);
    return response.data.Result;
  },

  createRole: async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
    const response = await api.post<CreateRoleResponse>("/vaitro", data);
    return response.data;
  },

  updateRole: async (
    id: string,
    data: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> => {
    const response = await api.put<UpdateRoleResponse>(`/vaitro/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<DeleteRoleResponse> => {
    const response = await api.delete<DeleteRoleResponse>(`/vaitro/${id}`);
    return response.data;
  },
};
