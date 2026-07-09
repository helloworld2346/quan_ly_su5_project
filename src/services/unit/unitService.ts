import api from "../api";
import type {
  DonViResponse,
  DonVi,
  UpdateDonViRequest,
  UpdateDonViResponse,
  CreateDonViRequest,
  CreateDonViResponse,
} from "../../types/account";

export const donviService = {
  getDonVi: async (): Promise<DonVi[]> => {
    const response = await api.get<DonViResponse>("/donvi");
    return response.data.Result;
  },

  createDonVi: async (
    data: CreateDonViRequest,
  ): Promise<CreateDonViResponse> => {
    const response = await api.post<CreateDonViResponse>("/donvi", data);
    return response.data;
  },

  updateDonVi: async (
    maDonVi: string,
    data: UpdateDonViRequest,
  ): Promise<UpdateDonViResponse> => {
    const response = await api.put<UpdateDonViResponse>(
      `/donvi/update/${maDonVi}`,
      data,
    );
    return response.data;
  },
};
