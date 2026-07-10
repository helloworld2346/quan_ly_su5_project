export interface NhatKyDonVi {
  maDonVi?: string;
  tenDonvi?: string;
  kyhieuDonvi?: string;
}

export interface NhatKyVaiTro {
  maVaiTro?: string;
  tenVaiTro?: string;
}

export interface NhatKyTaiKhoan {
  idTaiKhoan?: string;
  tenDangNhap?: string;
  tenTaiKhoan?: string;
  donVi?: NhatKyDonVi | null;
  vaiTro?: NhatKyVaiTro | null;
  createdAt?: string;
  updatedAt?: string;
  khoa?: boolean;
}

export interface NhatKy {
  idNhatKy: string;
  hanhDong: string;
  doiTuong: string;
  doiTuongId: string | null;
  moTa: string | null;
  giaTriCu: string | null;
  giaTriMoi: string | null;
  trangThai: string;
  thongBaoLoi: string | null;
  createdAt: string;
  taiKhoan: NhatKyTaiKhoan | string | null;
}

export interface NhatKyPage {
  content: NhatKy[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

// Payload lọc: tất cả optional, service sẽ loại field rỗng trước khi gửi
export interface NhatKySearchPayload {
  taiKhoan?: string;
  hanhDong?: string;
  doiTuong?: string;
  doiTuongId?: string;
  moTa?: string;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: string;
  thongBaoLoi?: string;
}

export interface NhatKySearchParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface NhatKySearchResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NhatKyPage;
}
