import api from "../api";
import type {
  DonViResponse,
  DonVi,
  UpdateDonViRequest,
  UpdateDonViResponse,
} from "../../types/account";

export const donviService = {
  getDonVi: async (): Promise<DonVi[]> => {
    const response = await api.get<DonViResponse>("/donvi");
    return response.data.Result;
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
