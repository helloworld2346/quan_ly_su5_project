import { apiNoPrefix } from "../api";
import type { DonViResponse, DonVi } from "../../types/account";

export const donviService = {
  getDonVi: async (): Promise<DonVi[]> => {
    const response = await apiNoPrefix.get<DonViResponse>("/donvi");
    return response.data.Result;
  },
  // ...
};
