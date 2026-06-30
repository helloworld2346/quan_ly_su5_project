import api from "../api";

export type CtDangCtApiItem = Record<string, any>;

export type CtDangCtResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  Result?: T;
  result?: T;
};

export type PoliticalWorkPayload = {
  tinhHinh: string;
  noiDungDotXuat: string;
  ketQua: string;
  trucBanNoiVu: string;
  trucBanCtDangCt: string;
  kienNghi: string;
  donVi: string;
};

function getResult<T>(res: CtDangCtResponse<T>): T | undefined {
  return res.Result ?? res.result;
}

export const politicalWorkReportService = {
  getByUnit: async (idDonVi: string) => {
    const response = await api.get<CtDangCtResponse<CtDangCtApiItem[] | CtDangCtApiItem>>(
      `/ctdangct/donVi/${idDonVi}`,
    );
    return getResult(response.data);
  },

  getChildrenByParentUnit: async (idDonViCha: string) => {
    const response = await api.get<CtDangCtResponse<CtDangCtApiItem[]>>(
      `/ctdangct/donViCha/${idDonViCha}`,
    );
    return getResult(response.data) ?? [];
  },

  getById: async (id: string) => {
    const response = await api.get<CtDangCtResponse<CtDangCtApiItem>>(`/ctdangct/${id}`);
    return getResult(response.data);
  },



  createReport: async (payload: PoliticalWorkPayload) => {

    const response = await api.post<CtDangCtResponse<CtDangCtApiItem>>(
      "/ctdangct",
      payload,
    );
    return response.data;
  },

  updateReport: async (id: string, payload: PoliticalWorkPayload) => {

    const response = await api.put<CtDangCtResponse<CtDangCtApiItem>>(
      `/ctdangct/${id}`,
      payload,
    );
    return response.data;
  },

  submitReport: async (id: string) => {
    const response = await api.put(`/ctdangct/waiting-approve/${id}`);
    return response.data;
  },

  recallReport: async (id: string) => {
    const response = await api.put(`/ctdangct/draft/${id}`);
    return response.data;
  },

  approveReport: async (id: string) => {
    const response = await api.put(`/ctdangct/approve/${id}`);
    return response.data;
  },

  refuseReport: async (id: string, ghiChu?: string) => {
    const response = await api.put(`/ctdangct/refuse/${id}`, { ghiChu });
    return response.data;
  },
};