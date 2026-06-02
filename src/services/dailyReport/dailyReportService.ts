import api from "../api";
import type {
  CreateReportRequest,
  CreateReportResponse,
} from "../../types/dailyReport";

export const dailyReportService = {
  createReport: async (
    payload: CreateReportRequest,
  ): Promise<CreateReportResponse> => {
    const response = await api.post<CreateReportResponse>(
      "/donbaocao",
      payload,
    );
    return response.data;
  },

  getReports: async (donVi: string, date?: string) => {
    const params = date ? { ngayBaoCao: date } : {};
    const response = await api.get(`/donbaocao/${donVi}`, { params });
    return response.data;
  },

  getReportById: async (id: string) => {
    const response = await api.get(`/donbaocao/detail/${id}`);
    return response.data;
  },
};
