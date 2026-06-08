export interface TrucNguoiPayload {
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
}

export interface KhungGioPayload {
  soNgayTruc: number;
  khunggioBatdau: string;
  khunggioKetthuc: string;
}

export interface CaTrucPayload {
  ngaytruc: string;
  matkhau: string;
  ghichu: string;
  trucChiHuy: string;
  trucBanTacChien: string;
}

export interface NguoiTrucDetail {
  idNguoitruc: string;
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface CaTrucDetail {
  idCatruc: string;
  ngaytruc: string;
  matkhau: string;
  ghichu: string | null;
  trucChiHuy: NguoiTrucDetail;
  trucBanTacChien: NguoiTrucDetail;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CaTrucDetailResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CaTrucDetail;
}

export interface TrucNguoiResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NguoiTrucDetail;
}

export interface KhungGioResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idKhunggio: string;
    soNgayTruc: number;
    khunggioBatdau: string;
    khunggioKetthuc: string;
    tenBaocao: string;
  };
}

export interface CaTrucCreateResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CaTrucDetail;
}

export interface GetCaTrucByDateResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CaTrucDetail | null;
}
export interface CapBac {
  idCapBac: string;
  tenCapBac: string;
  kyhieu: string;
}

export interface ChucVu {
  idChucVu: string;
  tenChucVu: string;
  mota: string;
}

export interface CapBacListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CapBac[];
}

export interface ChucVuListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ChucVu[];
}

export interface NguoiTrucWithCaTruc extends NguoiTrucDetail {
  caTruc: unknown[];
}

export interface NguoiTrucListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NguoiTrucWithCaTruc[];
}

export interface CaTrucListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CaTrucDetail[];
}

export interface UpdateCaTrucPayload {
  ngaytruc: string;
  matkhau: string;
  ghichu: string;
  trucChiHuy: string;
  trucBanTacChien: string;
}

export interface UpdateCaTrucResponse {
  success: boolean;
  code: number;
  message: string;
  Result: CaTrucDetail;
}