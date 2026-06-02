export interface Role {
  idVaiTro: string | null;
  tenVaiTro: string | null;
}

export interface DonVi {
  maDonVi: string;
  tenDonvi: string;
  donViCha: string | null;
  donViCon: string[];
  kyhieuDonvi: string;
  quanSoHsqBs: number;
  quanSoQncn: number;
  quanSoSiQuan: number;
  quanSoTong: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface Account {
  idTaiKhoan: string;
  tenDangNhap: string;
  tenTaiKhoan: string;
  vaiTro: Role;
  donVi?: {
    maDonVi: string;
    tenDonvi: string;
  };
  matKhau: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface AccountResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Account;
}

export interface RoleResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Role[];
}

export interface DonViResponse {
  success: boolean;
  code: number;
  message: string;
  Result: DonVi[];
}
