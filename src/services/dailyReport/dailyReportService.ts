import api from "../api";
import type {
  CreateReportRequest,
  CreateReportResponse,
  UpdateReportRequest,
  UpdateReportResponse,
  ApproveResponse,
  RefuseResponse,
  RefuseRequest,
  SearchReportResponse,
  SearchChildrenResponse,
  SearchByRangeResponse,
  LoaiDonBaoCao,
} from "../../types/dailyReport";
export interface NhiemVuNgay {
  idNhiemvuNgay: string;
  nhiemVuPhandoi: string;
  noiDungDotXuat: string;
  noiDungUuDiem: string;
  noiDungKhuyetDiem: string;
  noiDungCanGiaiQuyet: string;
}

export interface NhiemVuNgayResponse {
  success: boolean;
  code: number;
  message: string;
  result: NhiemVuNgay[];
}

export interface CreateNhiemVuNgayRequest {
  nhiemVuPhandoi: string;
  noiDungDotXuat: string;
  noiDungUuDiem: string;
  noiDungKhuyetDiem: string;
  noiDungCanGiaiQuyet: string;
  donBaoCao: string;
}

export interface NhiemVuNgaySingleResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NhiemVuNgay;
}

export type NhiemVuNgayChildrenItem = {
  donViResponse: {
    maDonVi: string;
    tenDonvi: string;
    kyhieuDonvi?: string;
    capDonVi?: string | null;
  };
  idNhiemvuNgay: string;
  nhiemVuPhandoi: string;
  noiDungDotXuat: string;
  noiDungUuDiem: string;
  noiDungKhuyetDiem: string;
  noiDungCanGiaiQuyet: string;
};

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

  getNhiemVuNgay: async (): Promise<NhiemVuNgayResponse> => {
    const response = await api.get<NhiemVuNgayResponse>("/nhiemvungay");
    return response.data;
  },

  updateReport: async (
    id: string,
    payload: UpdateReportRequest,
  ): Promise<UpdateReportResponse> => {
    const response = await api.put<UpdateReportResponse>(
      `/donbaocao/${id}`,
      payload,
    );
    return response.data;
  },

  approveReport: async (id: string): Promise<ApproveResponse> => {
    const response = await api.put<ApproveResponse>(`/donbaocao/approve/${id}`);
    return response.data;
  },

  refuseReport: async (
    id: string,
    payload: RefuseRequest,
  ): Promise<RefuseResponse> => {
    const response = await api.put<RefuseResponse>(
      `/donbaocao/refuse/${id}`,
      payload,
    );
    return response.data;
  },

  searchReportByUnitAndDate: async (
    maDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao: LoaiDonBaoCao = "DON_VI",
  ): Promise<SearchReportResponse> => {
    const response = await api.get<SearchReportResponse>(
      `/donbaocao/search/DonVi/${maDonVi}`,
      { params: { ngayLoc, loaiDonBaoCao } },
    );
    return response.data;
  },

  searchChildrenReports: async (
    maDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao: LoaiDonBaoCao = "DON_VI",
  ): Promise<SearchChildrenResponse> => {
    const response = await api.get<SearchChildrenResponse>(
      `/donbaocao/search/DonVi/${maDonVi}/children`,
      { params: { ngayLoc, loaiDonBaoCao } },
    );
    return response.data;
  },

  searchReportsByRange: async (
    idDonVi: string,
    start: string,
    end: string,
  ): Promise<SearchByRangeResponse> => {
    const response = await api.get<SearchByRangeResponse>(
      `/donbaocao/don-bao-cao/search`,
      { params: { idDonVi, start, end } },
    );
    return response.data;
  },

  submitReport: async (id: string): Promise<ApproveResponse> => {
    const response = await api.put<ApproveResponse>(
      `/donbaocao/submit/${id}`,
      null,
      { params: { id } },
    );
    return response.data;
  },

  recallReport: async (id: string): Promise<ApproveResponse> => {
    const response = await api.put<ApproveResponse>(
      `/donbaocao/recall/${id}`,
      null,
      { params: { id } },
    );
    return response.data;
  },

  createNhiemVuNgay: async (
    payload: CreateNhiemVuNgayRequest,
  ): Promise<NhiemVuNgayResponse> => {
    const response = await api.post<NhiemVuNgayResponse>(
      "/nhiemvungay",
      payload,
    );
    return response.data;
  },

  getNhiemVuNgayById: async (
    id: string,
  ): Promise<NhiemVuNgaySingleResponse> => {
    const response = await api.get<NhiemVuNgaySingleResponse>(
      `/nhiemvungay/${id}`,
    );
    return response.data;
  },

  getNhiemVuNgayByDonBaoCao: async (idDonBaoCao: string) => {
    const response = await api.get(`/nhiemvungay/donbaocao/${idDonBaoCao}`);
    return response.data as {
      success: boolean;
      Result: {
        idNhiemvuNgay: string;
        nhiemVuPhandoi: string;
        noiDungDotXuat: string;
        noiDungUuDiem: string;
        noiDungKhuyetDiem: string;
        noiDungCanGiaiQuyet: string;
      } | null;
    };
  },

  searchNhiemVuNgayChildrenByDonVi: async (
    maDonVi: string,
    ngayLoc: string,
  ) => {
    const response = await api.get(
      `/nhiemvungay/search/donvi/${maDonVi}/children`,
      { params: { ngayLoc } },
    );

    return response.data as {
      success: boolean;
      code: number;
      Result: Array<{
        idNhiemvuNgay: string;
        nhiemVuPhandoi: string;
        noiDungDotXuat: string;
        noiDungUuDiem: string;
        noiDungKhuyetDiem: string;
        noiDungCanGiaiQuyet: string;
        donViResponse: {
          maDonVi: string;
          tenDonvi: string;
          kyhieuDonvi?: string;
        };
      }>;
    };
  },

  updateNhiemVuNgay: async (id: string, payload: CreateNhiemVuNgayRequest) => {
    const response = await api.put(`/nhiemvungay/${id}`, payload);
    return response.data;
  },
};
