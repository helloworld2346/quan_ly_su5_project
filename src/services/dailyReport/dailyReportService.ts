import { apiNoPrefix } from "../api";
import type {
  CreateReportRequest,
  CreateReportResponse,
  SearchReportResponse,
  SearchChildrenResponse,
} from "../../types/dailyReport";

export const dailyReportService = {
  createReport: async (
    payload: CreateReportRequest,
  ): Promise<CreateReportResponse> => {
    const response = await apiNoPrefix.post<CreateReportResponse>(
      "/donbaocao",
      payload,
    );
    return response.data;
  },

  searchReportByUnitAndDate: async (
    maDonVi: string,
    ngayLoc: string,
  ): Promise<SearchReportResponse> => {
    const response = await apiNoPrefix.get<SearchReportResponse>(
      `/donbaocao/search/DonVi/${maDonVi}`,
      { params: { ngayLoc } },
    );
    return response.data;
  },

  searchChildrenReports: async (
    maDonVi: string,
    ngayLoc: string,
  ): Promise<SearchChildrenResponse> => {
    const response = await apiNoPrefix.get<SearchChildrenResponse>(
      `/donbaocao/search/DonVi/${maDonVi}/children`,
      { params: { ngayLoc } },
    );
    return response.data;
  },
};
