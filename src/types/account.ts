export interface Role {
  roleId: string | null;
  roleName: string | null;
}

export interface Account {
  idTaiKhoan: string;
  tenDangNhap: string;
  tenTaiKhoan: string;
  vaiTro: Role;
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
