import api from "../api";
import type { DonViResponse, DonVi } from "../../types/account";

export const donviService = {
  getDonVi: async (): Promise<DonVi[]> => {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://192.168.1.106:8080";
    const response = await api.get<DonViResponse>("/donvi", { baseURL });
    return response.data.Result;
  },

  getDonViByMa: async (maDonVi: string): Promise<DonVi | undefined> => {
    const allDonVi = await donviService.getDonVi();
    return allDonVi.find((dv) => dv.maDonVi === maDonVi);
  },
};
