export interface Role {
  roleId: string;
  roleName: string;
}

export interface Account {
  accountId: string;
  accountName: string;
  createdAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  password: string;
  role: Role;
  updatedAt: string;
  userName: string;
}

export interface AccountResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Account;
}
