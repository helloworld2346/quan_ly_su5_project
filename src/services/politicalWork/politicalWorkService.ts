import api from "../api";
import type {
  PoliticalWorkRequest,
  PoliticalWorkForm,
  RefuseRequest,
  PoliticalWorkSingleResponse,
  PoliticalWorkListResponse,
} from "../../types/politicalWork";

export const politicalWorkService = {
  createReport: async (
    payload: PoliticalWorkRequest,
    // TODO(file-attach): bật lại khi backend hỗ trợ upload/download
    // file?: File,
  ): Promise<PoliticalWorkSingleResponse> => {
    // TODO(file-attach): multipart form-data
    // const formData = new FormData();
    // formData.append(
    //   "data",
    //   new Blob([JSON.stringify(payload)], { type: "application/json" }),
    // );
    // if (file) formData.append("file", file);
    // const response = await api.post<PoliticalWorkSingleResponse>(
    //   "/ctdangct",
    //   formData,
    //   { headers: { "Content-Type": "multipart/form-data" } },
    // );

    const response = await api.post<PoliticalWorkSingleResponse>(
      "/ctdangct",
      payload,
    );
    return response.data;
  },

  // TODO(file-attach): bật lại khi backend có endpoint tải file
  // downloadFile: async (idCongtac: string): Promise<Blob> => {
  //   const response = await api.get(`/ctdangct/download/${idCongtac}`, {
  //     responseType: "blob",
  //   });
  //   return response.data;
  // },

  updateReport: async (
    idPoliticalWork: string,
    payload: PoliticalWorkForm,
  ): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/${idPoliticalWork}`,
      payload,
    );
    return response.data;
  },

  getById: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.get<PoliticalWorkSingleResponse>(
      `/ctdangct/${id}`,
    );
    return response.data;
  },

  getByDonVi: async (
    idDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao?: "DON_VI" | "TONG_HOP",
  ): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.get<PoliticalWorkSingleResponse>(
      `/ctdangct/search/DonVi/${idDonVi}`,
      {
        params: { ngayLoc, ...(loaiDonBaoCao ? { loaiDonBaoCao } : {}) },
        skipErrorToast: true,
      },
    );
    return response.data;
  },

  getByDonViCha: async (
    idDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao?: "DON_VI" | "TONG_HOP",
  ): Promise<PoliticalWorkListResponse> => {
    const response = await api.get<PoliticalWorkListResponse>(
      `/ctdangct/search/DonVi/${idDonVi}/children`,
      { params: { ngayLoc, ...(loaiDonBaoCao ? { loaiDonBaoCao } : {}) } },
    );
    return response.data;
  },

  getChildrenForPolitical: async (
    idDonVi: string,
    ngayLoc: string,
  ): Promise<PoliticalWorkListResponse> => {
    const response = await api.get<PoliticalWorkListResponse>(
      `/ctdangct/search/donViCha/${idDonVi}/children`,
      { params: { ngayLoc } },
    );
    return response.data;
  },

  getApprovedByDonVi: async (
    idDonVi: string,
    ngayLoc: string,
  ): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.get<PoliticalWorkSingleResponse>(
      `/ctdangct/search/DonVi/${idDonVi}/Status/Approvel`,
      { params: { ngayLoc } },
    );
    return response.data;
  },

  approveReport: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/approve/${id}`,
    );
    return response.data;
  },

  submitReport: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/waiting-approve/${id}`,
    );
    return response.data;
  },

  recallReport: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/draft/${id}`,
    );
    return response.data;
  },

  refuseReport: async (
    id: string,
    payload: RefuseRequest,
  ): Promise<PoliticalWorkSingleResponse> => {
    const response = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/refuse/${id}`,
      payload,
    );
    return response.data;
  },

  downloadFile: async (idCongtac: string): Promise<Blob> => {
    const response = await api.get(`/ctdangct/download/${idCongtac}`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
