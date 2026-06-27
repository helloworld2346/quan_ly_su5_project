import api from "../api";

import type {
  TrucNguoiPayload,
  TrucNguoiResponse,
  KhungGioPayload,
  KhungGioResponse,
  CaTrucPayload,
  CaTrucCreateResponse,
  GetCaTrucByDateResponse,
  CapBacListResponse,
  ChucVuListResponse,
  NguoiTrucListResponse,
  CaTrucDetailResponse,
  CaTrucListResponse,
  UpdateCaTrucPayload,
  UpdateCaTrucResponse,
} from "../../types/duty";

export const dutyService = {
  createTrucChiHuy: async (
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await api.post<TrucNguoiResponse>(
      "/truc-chi-huy",
      payload,
    );
    return res.data;
  },

  createTrucBanTacChien: async (
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await api.post<TrucNguoiResponse>(
      "/truc-ban-tac-chien",
      payload,
    );
    return res.data;
  },

  createKhungGioChiHuy: async (
    payload: KhungGioPayload,
  ): Promise<KhungGioResponse> => {
    const res = await api.post<KhungGioResponse>(
      "/khung-gio-bao-cao/banChiHuy",
      payload,
    );
    return res.data;
  },

  createKhungGioTacChien: async (
    payload: KhungGioPayload,
  ): Promise<KhungGioResponse> => {
    const res = await api.post<KhungGioResponse>(
      "/khung-gio-bao-cao/banTacChien",
      payload,
    );
    return res.data;
  },

  createCaTruc: async (
    payload: CaTrucPayload,
  ): Promise<CaTrucCreateResponse> => {
    const res = await api.post<CaTrucCreateResponse>(
      "/ca-truc",
      payload,
    );
    return res.data;
  },

  getCaTruc: async (idCatruc: string): Promise<CaTrucDetailResponse> => {
    const res = await api.get<CaTrucDetailResponse>(
      `/ca-truc/${idCatruc}`,
    );
    return res.data;
  },

  getCaTrucByDate: async (
    ngayTruc: string,
  ): Promise<GetCaTrucByDateResponse> => {
    const response = await api.get<GetCaTrucByDateResponse>(
      `/ca-truc/ngaytruc?ngayTruc=${ngayTruc}`,
    );
    return response.data;
  },

  getCapBac: async (): Promise<CapBacListResponse> => {
    const res = await api.get<CapBacListResponse>("/capbac");
    return res.data;
  },

  getChucVu: async (): Promise<ChucVuListResponse> => {
    const res = await api.get<ChucVuListResponse>("/chucvu");
    return res.data;
  },

  getAllTrucChiHuy: async (): Promise<NguoiTrucListResponse> => {
    const res = await api.get<NguoiTrucListResponse>("/truc-chi-huy");
    return res.data;
  },

  getAllTrucBanTacChien: async (): Promise<NguoiTrucListResponse> => {
    const res = await api.get<NguoiTrucListResponse>(
      "/truc-ban-tac-chien",
    );
    return res.data;
  },

  getAllCaTruc: async (): Promise<CaTrucListResponse> => {
    const res = await api.get<CaTrucListResponse>("/ca-truc");
    return res.data;
  },

  updateCaTruc: async (
    idCatruc: string,
    payload: UpdateCaTrucPayload,
  ): Promise<UpdateCaTrucResponse> => {
    const res = await api.put<UpdateCaTrucResponse>(
      `/ca-truc/${idCatruc}`,
      payload,
    );
    return res.data;
  },

  updateTrucChiHuy: async (
    id: string,
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await api.put<TrucNguoiResponse>(
      `/truc-chi-huy/${id}`,
      payload,
    );
    return res.data;
  },

  deleteTrucChiHuy: async (id: string): Promise<TrucNguoiResponse> => {
    const res = await api.delete<TrucNguoiResponse>(
      `/truc-chi-huy/${id}`,
    );
    return res.data;
  },

  updateTrucBanTacChien: async (
    id: string,
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await api.put<TrucNguoiResponse>(
      `/truc-ban-tac-chien/${id}`,
      payload,
    );
    return res.data;
  },

  deleteTrucBanTacChien: async (id: string): Promise<TrucNguoiResponse> => {
    const res = await api.delete<TrucNguoiResponse>(
      `/truc-ban-tac-chien/${id}`,
    );
    return res.data;
  },
};
