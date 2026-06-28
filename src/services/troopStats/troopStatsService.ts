import api from "../api";
export interface DonViItem {
  tenDonVi: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  tyLeHienDien: number;
}

export interface ThongKeQuanSoResult {
  ngayBaoCao: string;
  tongQuanSo: number;
  tongHienDien: number;
  tongVang: number;
  tyLeHienDien: number;
  tyLeVang: number;
  soSanh: {
    homQua: { tangGiam: number; phanTram: number };
    tuanTruoc: { tangGiam: number; phanTram: number };
    thangTruoc: { tangGiam: number; phanTram: number };
  };
  donViTieuBieu: {
    hienDienCaoNhat: { ten: string; tyLe: number };
    vangCaoNhat: { ten: string; tyLe: number };
  };
  danhSachDonVi: DonViItem[];
}

export interface ThongKeQuanSoResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ThongKeQuanSoResult;
}

export const troopStatsService = {
  getThongKe: async (ngayBaoCao: string): Promise<ThongKeQuanSoResult> => {
    const response = await api.get<ThongKeQuanSoResponse>("/thong-ke", {
      params: { ngayBaoCao },
    });
    return response.data.Result;
  },
};
