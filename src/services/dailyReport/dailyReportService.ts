import { apiNoPrefix } from "../api";
import type {
  CreateReportRequest,
  CreateReportResponse,
  UpdateReportRequest,
  UpdateReportResponse,
  ApproveResponse,
  RefuseResponse,
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

  updateReport: async (
    id: string,
    payload: UpdateReportRequest,
  ): Promise<UpdateReportResponse> => {
    const response = await apiNoPrefix.put<UpdateReportResponse>(
      `/donbaocao/${id}`,
      payload,
    );
    return response.data;
  },

  approveReport: async (id: string): Promise<ApproveResponse> => {
    const response = await apiNoPrefix.put<ApproveResponse>(
      `/donbaocao/approve/${id}`,
    );
    return response.data;
  },

  refuseReport: async (id: string): Promise<RefuseResponse> => {
    const response = await apiNoPrefix.put<RefuseResponse>(
      `/donbaocao/refuse/${id}`,
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
