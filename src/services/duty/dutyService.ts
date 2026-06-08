import { apiNoPrefix } from "../api";
import api from "../api"

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
} from "../../types/duty";

export const dutyService = {
  createTrucChiHuy: async (
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await apiNoPrefix.post<TrucNguoiResponse>(
      "/truc-chi-huy",
      payload,
    );
    return res.data;
  },

  createTrucBanTacChien: async (
    payload: TrucNguoiPayload,
  ): Promise<TrucNguoiResponse> => {
    const res = await apiNoPrefix.post<TrucNguoiResponse>(
      "/truc-ban-tac-chien",
      payload,
    );
    return res.data;
  },

  createKhungGioChiHuy: async (
    payload: KhungGioPayload,
  ): Promise<KhungGioResponse> => {
    const res = await apiNoPrefix.post<KhungGioResponse>(
      "/khung-gio-bao-cao/banChiHuy",
      payload,
    );
    return res.data;
  },

  createKhungGioTacChien: async (
    payload: KhungGioPayload,
  ): Promise<KhungGioResponse> => {
    const res = await apiNoPrefix.post<KhungGioResponse>(
      "/khung-gio-bao-cao/banTacChien",
      payload,
    );
    return res.data;
  },

  createCaTruc: async (
    payload: CaTrucPayload,
  ): Promise<CaTrucCreateResponse> => {
    const res = await apiNoPrefix.post<CaTrucCreateResponse>(
      "/ca-truc",
      payload,
    );
    return res.data;
  },

  getCaTruc: async (idCatruc: string): Promise<CaTrucDetailResponse> => {
    const res = await apiNoPrefix.get<CaTrucDetailResponse>(
      `/ca-truc/${idCatruc}`,
    );
    return res.data;
  },

  getCaTrucByDate: async (
    ngayTruc: string,
  ): Promise<GetCaTrucByDateResponse> => {
    const response = await apiNoPrefix.get<GetCaTrucByDateResponse>(
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
    const res = await apiNoPrefix.get<NguoiTrucListResponse>("/truc-chi-huy");
    return res.data;
  },

  getAllTrucBanTacChien: async (): Promise<NguoiTrucListResponse> => {
    const res = await apiNoPrefix.get<NguoiTrucListResponse>(
      "/truc-ban-tac-chien",
    );
    return res.data;
  },
};

