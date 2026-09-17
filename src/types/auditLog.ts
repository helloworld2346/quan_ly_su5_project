export interface NhatKyDonVi {
  maDonVi?: string;
  tenDonvi?: string;
  kyhieuDonvi?: string;
  capDonVi?: string;
}

export interface NhatKyVaiTro {
  idVaiTro?: string;
  tenVaiTro?: string;
  tenChucnang?: string[];
}

export interface NhatKyTaiKhoan {
  idTaiKhoan?: string;
  tenDangNhap?: string;
  tenTaiKhoan?: string;
  matKhau?: string;
  donVi?: NhatKyDonVi | null;
  vaiTro?: NhatKyVaiTro | null;
  chucNangThem?: string[];
  chucNangBo?: string[];
  tenChucnang?: string[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
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
  uri: string | null;
  ipAddress: string | null;
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
